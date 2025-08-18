import InvitationCard from '@/components/home-page/myInvitationsCard';
import TopBarWithChips from '@/components/home-page/topBarWithChips';
import { useGetInvitations } from '@/hooks/apis/invitations/useGetInvitations';
import { getToken } from '@/shared/helpers/storeToken';
import { RootState } from '@/store';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback, View as RNView, View, } from 'react-native';
import {
  Button,
  Dialog,
  Menu,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { clearAllFilters, filterInvitations } from '@/components/home-page/filters';
import PlayerDetailsModal from '@/components/home-page/PlayerDetailsModal';
import OutgoingInviteCardItem, { Invite } from '@/components/home-page/outgoingInvitationsCard';
import OpenPlayCard from '@/components/home-page/openPlayCard';
import { useGetPlays } from '@/hooks/apis/join-play/useGetPlays';
import { useGetPlayerInvitationSent } from '@/hooks/apis/player-finder/useGetPlayerInivitationsSent';

const API_URL = 'https://api.vddette.com';

const AllInvitations = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const userId = user?.userId;
    const { data: invites, refetch } = useGetInvitations({userId: userId,});
    const { data: invitee = [] } = useGetPlayerInvitationSent({inviteeEmail: user?.email}) as { data: Invite[] | null };
    const openClubId = user?.currentActiveClubId || 'GLOBAL';
    const { data: openPlayInvites, status , error, refetch:refetchOpenPlay } = useGetPlays(openClubId,userId);

  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [selectedAction, setSelectedAction] = useState<
    'accept' | 'reject' | null
  >(null);

  const [playerCounts, setPlayerCounts] = useState<{
    [key: string]: { accepted: number; total: number };
  }>({});

  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState<Date | null>(selectedDate ?? new Date());
  const [tempTime, setTempTime] = useState<Date | null>(selectedTime ?? new Date());
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [locationMenuVisible, setLocationMenuVisible] = useState(false);

    const getInviteDate = (invite: any) => {
        if (!invite.playTime) return null;
        const [year, month, day, hour, minute] = invite.playTime;
        return new Date(year, month - 1, day, hour, minute);
    };
    const upcomingInvites = (invites ?? [])
        .filter((inv) => {
        const eventDate = getInviteDate(inv);
        return eventDate && eventDate >= new Date();
        })
    const outgoingInvites = (invitee ?? [])
    .filter((inv) => {
        const eventDate = getInviteDate(inv);
        return eventDate && eventDate >= new Date();
    })

    const showCommentDialog = (invite: any, action: 'accept' | 'reject') => {
      setSelectedInvite(invite);
      setSelectedAction(action);
      setDialogVisible(true);
      setComment('');
    };

  const handleDialogSubmit = async () => {
    if (!selectedInvite || !selectedAction) return;
    try {
      setLoadingId(selectedInvite.id);
      const rawUrl =
        selectedAction === 'accept'
          ? selectedInvite.acceptUrl
          : selectedInvite.declineUrl;

      const baseUrl = rawUrl.replace(
        /^http:\/\/44\.216\.113\.234:8080/,
        'https://api.vddette.com'
      );
      const url = `${baseUrl}&comments=${encodeURIComponent(comment)}`;

      const response = await fetch(url);
      if (response.status === 200) {
        Alert.alert('Success', `Invitation ${selectedAction}ed`);
        refetch();
      } else {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        Alert.alert(
          'Error',
          `Failed to ${selectedAction} invitation. You may have another event at the same time.`
        );
      }
    } catch (e) {
      Alert.alert(
        'Error',
        `Something went wrong while trying to ${selectedAction}`
      );
    } finally {
      setLoadingId(null);
      setDialogVisible(false);
    }
  };

  useEffect(() => {
    const fetchCounts = async () => {
      const newCounts: { [key: string]: { accepted: number; total: number } } =
        {};
      for (const invite of invites ?? []) {
        try {
          const token = await getToken();
          const res = await axios.get(
            `${API_URL}/api/player-tracker/tracker/request`,
            {
              params: { requestId: invite.requestId },
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const total = res.data[0]?.playersNeeded +1 || 1;
          const accepted = res.data.filter(
            (p: any) => p.status === 'ACCEPTED'
          ).length+1;

          newCounts[invite.requestId] = { accepted, total };
        } catch (error) {
          newCounts[invite.requestId] = { accepted: 0, total: 1 };
        }
      }
      setPlayerCounts(newCounts);
    };

    if (invites && invites.length > 0) {
      fetchCounts();
    }
  }, [invites]);

  const uniqueLocations = Array.from(
    new Set((invites ?? []).map((inv) => inv.placeToPlay).filter(Boolean))
  );

  const filteredInvites = filterInvitations(
    upcomingInvites,
    selectedDate,
    selectedTime,
    selectedLocation
  );
  const filteredSentInvites = filterInvitations(
    outgoingInvites,
    selectedDate,
    selectedTime,
    selectedLocation
  );

  const clearFilters = () => {
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
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch player details');
    }
  };

  return (
    <LinearGradient colors={['#E0F7FA', '#FFFFFF']} style={{ flex: 1 }}>
      <TopBarWithChips active='all' />
      <View style={styles.filterRow}>
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

        <Button
          mode='outlined'
          compact
          onPress={clearFilters}
          style={styles.smallClearButton}
          contentStyle={styles.filterButtonContent}
        >
          <Text style={styles.clearButtonLabel}>Clear Filters</Text>
        </Button>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Incoming Invitations */}
        <Text style={styles.sectionTitle}>Incoming Invitations</Text>
        {filteredInvites.length === 0 ? (
            <Text style={styles.noData}>No incoming invitations.</Text>
        ) : (
            filteredInvites.map((invite) => (
            <View key={`incoming-${invite.id}`} style={styles.cardContainer}>
                <InvitationCard
                invite={invite}
                onAccept={() => showCommentDialog(invite, 'accept')}
                onReject={() => showCommentDialog(invite, 'reject')}
                loading={loadingId === invite.id}
                totalPlayers={playerCounts[invite.requestId]?.total ?? 1}
                acceptedPlayers={playerCounts[invite.requestId]?.accepted ?? 0}
                onViewPlayers={handleViewPlayers}
                />
            </View>
            ))
        )}

        {/* Outgoing Invitations */}
        <Text style={styles.sectionTitle}>Sent Invitations</Text>
        {filteredSentInvites.length === 0 ? (
            <Text style={styles.noData}>No outgoing invitations.</Text>
        ) : (
            filteredSentInvites.map((invite, idx) => (
            <View key={`outgoing-${idx}`} style={styles.cardContainer}>
                <OutgoingInviteCardItem
                invite={{
                    ...(invite as Invite),
                    dateTimeMs: new Date(
                    invite.playTime[0],
                    invite.playTime[1] - 1,
                    invite.playTime[2],
                    invite.playTime[3] || 0,
                    invite.playTime[4] || 0
                    ).getTime(),
                    accepted: playerCounts[invite.requestId]?.accepted ?? invite.accepted,
                    playersNeeded:
                    invite.playersNeeded ??
                    playerCounts[invite.requestId]?.total ??
                    0,
                }}
                onViewPlayers={handleViewPlayers}
                />
            </View>
            ))
        )}

        {/* Open Play Invitations */}
        <Text style={styles.sectionTitle}>Open Play Requests</Text>
        {(!openPlayInvites || openPlayInvites.length === 0) ? (
            <Text style={styles.noData}>No open play requests.</Text>
        ) : (
            <OpenPlayCard
            data={(openPlayInvites || [])
                .map((play) => {
                const startDate = new Date(
                    play.startTime[0],
                    play.startTime[1] - 1,
                    play.startTime[2],
                    play.startTime[3] || 0,
                    play.startTime[4] || 0
                );
                return {
                    ...play,
                    dateTimeMs: startDate.getTime(),
                    placeToPlay: play.allCourts?.Name || 'Unknown Court',
                    eventName:
                    play.eventName?.replace(/_/g, ' ') || 'Unknown Play',
                    accepted: play.registeredPlayers?.length ?? 0,
                    playersNeeded: play.maxPlayers ?? 1,
                    isWaitlisted: play.waitlistedPlayers?.includes(userId),
                };
                })
                .filter((play) => play.dateTimeMs >= Date.now())
                .sort((a, b) => Number(a.dateTimeMs) - Number(b.dateTimeMs))}
            refetch={refetch}
            />
        )}

        </ScrollView>

      {/* iOS Date Picker Modal */}
      {Platform.OS === 'ios' && showDatePicker && (
        <Modal
          transparent
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
            <RNView style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <SafeAreaView style={styles.modalContent}>
                  <DateTimePicker
                    value={tempDate ?? new Date()}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) => {
                      if (Platform.OS === 'ios' && date) {
                        setTempDate(date); // update only temp state
                      }
                    }}
                  />
                  <RNView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Button
                      onPress={() => {
                        setShowDatePicker(false);
                        setTempDate(selectedDate); // discard changes
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onPress={() => {
                        setShowDatePicker(false);
                        if (tempDate) setSelectedDate(tempDate); // apply changes
                      }}
                    >
                      Done
                    </Button>
                  </RNView>
                </SafeAreaView>
              </TouchableWithoutFeedback>
            </RNView>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* iOS Time Picker Modal */}
      {Platform.OS === 'ios' && showTimePicker && (
        <Modal
          transparent
          animationType="slide"
          visible={showTimePicker}
          onRequestClose={() => setShowTimePicker(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowTimePicker(false)}>
            <RNView style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <SafeAreaView style={styles.modalContent}>
                  <DateTimePicker
                    value={tempTime ?? new Date()}
                    mode="time"
                    display="spinner"
                    onChange={(event, time) => {
                      if (Platform.OS === 'ios' && time) {
                        setTempTime(time);
                      }
                    }}
                    style={{ backgroundColor: 'white' }}
                  />
                  <RNView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Button
                      onPress={() => {
                        setShowTimePicker(false);
                        setTempTime(selectedTime); // discard changes
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onPress={() => {
                        setShowTimePicker(false);
                        if (tempTime) setSelectedTime(tempTime); // apply changes
                      }}
                    >
                      Done
                    </Button>
                  </RNView>
                </SafeAreaView>
              </TouchableWithoutFeedback>
            </RNView>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* Android Date Picker Modal */}
      {Platform.OS === 'android' && showDatePicker && (
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

      {/* Android Time Picker Modal */}
      {Platform.OS === 'android' && showTimePicker && (
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
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Title>Add a message</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label='Comment (optional)'
              value={comment}
              onChangeText={setComment}
              mode='outlined'
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDialogSubmit}>Submit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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

export default AllInvitations;

const styles = StyleSheet.create({
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
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    elevation: 3,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    paddingHorizontal: 16,
    margin: 16,
    letterSpacing: 0.2,
    },
  noData: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 300,
  },
});
