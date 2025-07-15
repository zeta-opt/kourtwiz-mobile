import InvitationCard from '@/components/home-page/myInvitationsCard';
import { useGetInvitations } from '@/hooks/apis/invitations/useGetInvitations';
import { getToken } from '@/shared/helpers/storeToken';
import { RootState } from '@/store';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Dialog,
  Menu,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { useSelector } from 'react-redux';

const API_URL = 'http://44.216.113.234:8080';

const ShowInvitations = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const { data: invites, refetch } = useGetInvitations({ userId: user?.userId });

  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [selectedAction, setSelectedAction] = useState<'accept' | 'reject' | null>(null);

  const [playerCounts, setPlayerCounts] = useState<{ [key: string]: { accepted: number; total: number } }>({});

  // Filter states
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [locationMenuVisible, setLocationMenuVisible] = useState(false);

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
      const baseUrl = selectedAction === 'accept' ? selectedInvite.acceptUrl : selectedInvite.declineUrl;
      const url = `${baseUrl}&comments=${encodeURIComponent(comment)}`;

      const response = await fetch(url);
      if (response.status === 200) {
        Alert.alert('Success', `Invitation ${selectedAction}ed`);
        refetch();
      } else {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        Alert.alert('Error', `Failed to ${selectedAction} invitation. You may have another event at the same time.`);
      }
    } catch (e) {
      Alert.alert('Error', `Something went wrong while trying to ${selectedAction}`);
    } finally {
      setLoadingId(null);
      setDialogVisible(false);
    }
  };

  // Fetch accepted/total player counts
  useEffect(() => {
    const fetchCounts = async () => {
      const newCounts: { [key: string]: { accepted: number; total: number } } = {};
      for (const invite of invites ?? []) {
        try {
          const token = await getToken();
          const res = await axios.get(`${API_URL}/api/player-tracker/tracker/request`, {
            params: { requestId: invite.requestId },
            headers: { Authorization: `Bearer ${token}` },
          });

          const total = res.data.length;
          const accepted = res.data.filter((p: any) => p.status === 'ACCEPTED').length;

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

  // Unique locations for dropdown
  const uniqueLocations = Array.from(new Set((invites ?? []).map((inv) => inv.placeToPlay).filter(Boolean)));

  // Correct filtering
  const filteredInvites = (invites ?? []).filter((invite) => {
    let matches = true;

    if (selectedDate) {
      const inviteDate = new Date(invite.playTime[0], invite.playTime[1] - 1, invite.playTime[2]);
      const selectedDateStr = selectedDate.toDateString();
      const inviteDateStr = inviteDate.toDateString();
      matches &&= selectedDateStr === inviteDateStr;
    }

    if (selectedTime) {
      const inviteTime = new Date(invite.playTime[0], invite.playTime[1] - 1, invite.playTime[2], invite.playTime[3], invite.playTime[4]);
      matches &&=
        inviteTime.getHours() === selectedTime.getHours() &&
        inviteTime.getMinutes() === selectedTime.getMinutes();
    }

    if (selectedLocation) {
      matches &&= invite.placeToPlay === selectedLocation;
    }

    return matches;
  });

  // Reset filters
  const clearFilters = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedLocation(null);
  };

  return (
    <LinearGradient colors={['#E0F7FA', '#FFFFFF']} style={{ flex: 1 }}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }} />
        <Button
          mode="outlined"
          onPress={clearFilters}
          style={styles.clearButton}
          labelStyle={styles.clearButtonLabel}
        >
          Clear
        </Button>
      </View>

      <View style={styles.filterRow}>
        <Button
          mode="outlined"
          style={[styles.filterButton, selectedDate && styles.activeFilterButton]}
          contentStyle={styles.filterButtonContent}
          labelStyle={styles.filterButtonLabel}
          onPress={() => setShowDatePicker(true)}
        >
          Date <View style={{ marginTop: 7 }}><MaterialIcons name="keyboard-arrow-down" size={18} /></View>

        </Button>
        <Button
          mode="outlined"
          style={[styles.filterButton, selectedTime && styles.activeFilterButton]}
          contentStyle={styles.filterButtonContent}
          labelStyle={styles.filterButtonLabel}
          onPress={() => setShowTimePicker(true)}
        >
          Time <View style={{ marginTop: 7 }}><MaterialIcons name="keyboard-arrow-down" size={18} /></View>

        </Button>
        <Menu
          visible={locationMenuVisible}
          onDismiss={() => setLocationMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              style={[styles.filterButton, selectedLocation && styles.activeFilterButton]}
              contentStyle={styles.filterButtonContent}
              labelStyle={styles.filterButtonLabel}
              onPress={() => setLocationMenuVisible(true)}
            >
              Location <View style={{ marginTop: 7 }}><MaterialIcons name="keyboard-arrow-down" size={18} /></View>

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
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredInvites.length === 0 ? (
          <Text style={styles.noData}>No invitations to show.</Text>
        ) : (
          filteredInvites.map((invite) => (
            <View key={invite.id} style={styles.cardContainer}>
              <InvitationCard
                invite={invite}
                onAccept={() => showCommentDialog(invite, 'accept')}
                onReject={() => showCommentDialog(invite, 'reject')}
                loading={loadingId === invite.id}
                totalPlayers={playerCounts[invite.requestId]?.total ?? 1}
                acceptedPlayers={playerCounts[invite.requestId]?.accepted ?? 0}
              />
            </View>
          ))
        )}
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="calendar"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setSelectedDate(date);
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={selectedTime || new Date()}
          mode="time"
          display="spinner"
          onChange={(event, time) => {
            setShowTimePicker(false);
            if (time) {
              setSelectedTime(time);
            }
          }}
        />
      )}

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Add a message</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Comment (optional)"
              value={comment}
              onChangeText={setComment}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDialogSubmit}>Submit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </LinearGradient>
  );
};

export default ShowInvitations;

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  clearButton: {
    borderColor: 'red',
    borderWidth: 1,
    borderRadius: 8,
  },
  clearButtonLabel: {
    color: 'red',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#008080',
    backgroundColor: '#FFFFFF',
  },
  activeFilterButton: {
    backgroundColor: '#00808020',
  },
  filterButtonContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    height: 40,
  },
  filterButtonLabel: {
    fontSize: 15,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
  },
  noData: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
  },
});
