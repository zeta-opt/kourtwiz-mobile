import OutgoingInviteCardItem, {
  Invite,
} from '@/components/home-page/outgoingInvitationsCard';
import { useGetPlayerInvitationSent } from '@/hooks/apis/player-finder/useGetPlayerInivitationsSent';
import { getToken } from '@/shared/helpers/storeToken';
import { RootState } from '@/store';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, Menu, Portal, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { clearAllFilters, filterInvitations } from '@/components/home-page/filters';
import PlayerDetailsModal from '../home-page/PlayerDetailsModal';
import TopBarWithChips from '@/components/home-page/topBarWithChips';

const API_URL = 'https://api.vddette.com';

const ShowSentInvitations = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: invites = [] } = useGetPlayerInvitationSent({
    inviteeEmail: user?.email,
  }) as { data: Invite[] | null };
  const [playerCounts, setPlayerCounts] = useState<{
    [key: string]: { accepted: number; total: number };
  }>({});

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [locationMenuVisible, setLocationMenuVisible] = useState(false);
  const playerCountCache = useRef<{
    [key: string]: { accepted: number; total: number };
  }>({});

  useEffect(() => {
    const fetchCounts = async () => {
      const newCounts: { [key: string]: { accepted: number; total: number } } =
        {};
      const promises = [];

      const requestIdsToFetch = (invites ?? [])
        .map((inv) => inv.requestId)
        .filter(
          (requestId, index, self) =>
            self.indexOf(requestId) === index &&
            !playerCountCache.current[requestId]
        );

      if (requestIdsToFetch.length === 0) {
        setPlayerCounts({ ...playerCountCache.current });
        return;
      }

      const token = await getToken();

      for (const requestId of requestIdsToFetch) {
        const promise = axios
          .get(`${API_URL}/api/player-tracker/tracker/request`, {
            params: { requestId },
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            const total = res.data[0]?.playersNeeded || 1;
            const accepted = res.data.filter(
              (p: any) => p.status === 'ACCEPTED'
            ).length;
            newCounts[requestId] = { accepted, total };
            playerCountCache.current[requestId] = { accepted, total };
          })
          .catch(() => {
            newCounts[requestId] = { accepted: 0, total: 1 };
            playerCountCache.current[requestId] = { accepted: 0, total: 1 };
          });

        promises.push(promise);
      }

      await Promise.all(promises);
      setPlayerCounts({ ...playerCountCache.current });
    };

    if (invites && invites.length > 0) {
      fetchCounts();
    }
  }, [invites]);

  const uniqueLocations = useMemo(
    () =>
      Array.from(
        new Set((invites ?? []).map((inv) => inv.placeToPlay).filter(Boolean))
      ),
    [invites]
  );

  const filteredInvites = useMemo(() => {
    const uniqueMap = new Map<string, Invite>();

    for (const inv of invites ?? []) {
      if (inv.status !== 'WITHDRAWN' || !uniqueMap.has(inv.requestId)) {
        uniqueMap.set(inv.requestId, inv);
      }
    }

    const uniqueInvites = Array.from(uniqueMap.values());
    return filterInvitations(
      uniqueInvites,
      selectedDate,
      selectedTime,
      selectedLocation
    );
  }, [invites, selectedDate, selectedTime, selectedLocation]);

  const clearFiltersHandler = () => {
    clearAllFilters({
      setSelectedDate,
      setSelectedTime,
      setSelectedLocation,
    });
  };
  const [playerDetailsVisible, setPlayerDetailsVisible] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]);
  const handleViewPlayers = async (requestId: string) => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${API_URL}/api/player-tracker/tracker/request`,
        {
          params: { requestId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedPlayers(res.data);
      setPlayerDetailsVisible(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch player details');
    }
  };

  return (
    <LinearGradient colors={['#E0F7FA', '#FFFFFF']} style={{ flex: 1 }}>
      <TopBarWithChips active='sent' />
      {/* Filters */}
      <View style={styles.filterRow}>
        {/* Date */}
        <Button
          mode='outlined'
          compact
          style={[
            styles.filterButtonSmall,
            selectedDate && styles.activeFilterButton,
          ]}
          contentStyle={styles.filterButtonContent}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={styles.buttonInner}>
            <Text style={styles.filterButtonLabel}>Date</Text>
            <MaterialIcons name='keyboard-arrow-down' size={16} />
          </View>
        </Button>

        {/* Time */}
        <Button
          mode='outlined'
          compact
          style={[
            styles.filterButtonSmall,
            selectedTime && styles.activeFilterButton,
          ]}
          contentStyle={styles.filterButtonContent}
          onPress={() => setShowTimePicker(true)}
        >
          <View style={styles.buttonInner}>
            <Text style={styles.filterButtonLabel}>Time</Text>
            <MaterialIcons name='keyboard-arrow-down' size={16} />
          </View>
        </Button>

        {/* Location */}
        <Menu
          visible={locationMenuVisible}
          onDismiss={() => setLocationMenuVisible(false)}
          anchor={
            <Button
              mode='outlined'
              compact
              style={[
                styles.filterButtonLarge,
                selectedLocation && styles.activeFilterButton,
              ]}
              contentStyle={styles.filterButtonContent}
              onPress={() => setLocationMenuVisible(true)}
            >
              <View style={styles.buttonInner}>
                <Text style={styles.filterButtonLabel}>Location</Text>
                <MaterialIcons name='keyboard-arrow-down' size={16} />
              </View>
            </Button>
          }
        >
          {uniqueLocations.map((loc, index) => (
            <Menu.Item
              key={`${loc}-${index}`}
              onPress={() => {
                setSelectedLocation(loc);
                setLocationMenuVisible(false);
              }}
              title={loc}
            />
          ))}
        </Menu>

        {/* Clear Filters */}
        <Button
          mode='outlined'
          compact
          onPress={clearFiltersHandler}
          style={styles.smallClearButton}
          contentStyle={styles.filterButtonContent}
        >
          <Text style={styles.clearButtonLabel}>Clear filters</Text>
        </Button>
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredInvites.length === 0 ? (
          <Text style={styles.noData}>No outgoing invites found.</Text>
        ) : (
          filteredInvites.map((invite, idx) => (
            <View key={idx} style={styles.cardContainer}>
              <OutgoingInviteCardItem
                invite={{
                  requestId: invite.requestId,
                  playTime: invite.playTime,
                  placeToPlay: invite.placeToPlay,
                  dateTimeMs: new Date(
                    invite.playTime[0],
                    invite.playTime[1] - 1,
                    invite.playTime[2],
                    invite.playTime[3] || 0,
                    invite.playTime[4] || 0
                  ).getTime(),
                  accepted: playerCounts[invite.requestId]?.accepted ?? 0,
                  playersNeeded:
                    invite.playersNeeded ??
                    playerCounts[invite.requestId]?.total ??
                    0,
                  status: invite.status,
                }}
                //disabled
                onViewPlayers={handleViewPlayers}
              />
            </View>
          ))
        )}
      </ScrollView>

      {/* Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode='date'
          display='calendar'
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime || new Date()}
          mode='time'
          display='spinner'
          onChange={(event, time) => {
            setShowTimePicker(false);
            if (time) setSelectedTime(time);
          }}
        />
      )}
      <Portal>
        <Dialog
          visible={playerDetailsVisible}
          onDismiss={() => setPlayerDetailsVisible(false)}
          style={styles.bottomDialog}
        >
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              <PlayerDetailsModal players={selectedPlayers} />
            </ScrollView>
          </Dialog.ScrollArea>
        </Dialog>
      </Portal>
    </LinearGradient>
  );
};

export default ShowSentInvitations;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'space-between',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  filterButtonSmall: {
    flex: 1,
    minWidth: 70,
    marginHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#008080',
    backgroundColor: '#FFFFFF',
    height: 40,
  },
  filterButtonLarge: {
    flex: 1.2,
    minWidth: 90,
    marginHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#008080',
    backgroundColor: '#FFFFFF',
    height: 40,
  },
  activeFilterButton: {
    backgroundColor: '#00808020',
  },
  smallClearButton: {
    flex: 1,
    borderColor: '#008080',
    borderWidth: 1,
    borderRadius: 25,
    marginHorizontal: 2,
    minWidth: 60,
    backgroundColor: '#008080',
    height: 40,
  },
  clearButtonLabel: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  filterButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonLabel: {
    fontSize: 12,
    color: '#000000',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  noData: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    elevation: 3,
    marginBottom: 16,
  },
  bottomDialog: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    margin: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'white',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  dialogContent: {
    padding: 16,
  },
});
