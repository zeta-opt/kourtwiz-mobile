import UserAvatar from '@/assets/UserAvatar';
import InvitationCard from '@/components/home-page/myInvitationsCard';
import OpenPlayCard from '@/components/home-page/openPlayCard';
import OutgoingInviteCardItem from '@/components/home-page/outgoingInvitationsCard';
import PlayerDetailsModal from '@/components/home-page/PlayerDetailsModal';
import { useGetInitiatedPlays } from '@/hooks/apis/join-play/useGetInitiatedPlays';
import { useCancelInvitation } from '@/hooks/apis/player-finder/useCancelInvite';
import { useGetPlayerEventsByDate } from '@/hooks/apis/set-availability/useGetPlayerEventsByDate';
import * as Location from 'expo-location';
import { useGetPlayerSchedule } from '@/hooks/apis/set-availability/useGetPlayerSchedule';
import { getToken } from '@/shared/helpers/storeToken';
import { RootState } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import {
  Button,
  Dialog,
  Modal,
  Provider as PaperProvider,
  Portal,
  TextInput,
} from 'react-native-paper';
import { useSelector } from 'react-redux';

const API_URL = 'https://api.vddette.com';

// Utilities
const parseArrayToDate = (arr: any): Date => {
  if (!arr) return new Date();

  // if nested array like [[2025,9,28,18,30]], pick the first element
  if (Array.isArray(arr) && Array.isArray(arr[0])) {
    arr = arr[0];
  }

  // if flat array of numbers
  if (Array.isArray(arr) && arr.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = arr;
    return new Date(year, month - 1, day, hour, minute, second);
  }

  // fallback: try Date constructor (if string or object)
  return new Date(arr);
};

const isSameDay = (dateArray: any, selectedDate: string) => {
  if (!dateArray) return false;

  // handle nested array
  if (Array.isArray(dateArray) && Array.isArray(dateArray[0])) {
    dateArray = dateArray[0];
  }

  if (!Array.isArray(dateArray) || dateArray.length < 3) return false;

  const [year, month, day] = dateArray;
  return format(new Date(year, month - 1, day), 'yyyy-MM-dd') === selectedDate;
};
export default function PlayCalendarPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const userId = user?.userId;
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setCoords({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      })();
    }, []);

  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState<string>(today);

  const { data: eventsForSelectedDate, refetch } = useGetPlayerEventsByDate(
    selectedDate,
    userId,
    coords?.lat,
    coords?.lng
  );
  
  const { data: schedule, refetch: fetchSchedule } =
    useGetPlayerSchedule(
    userId,
    coords?.lat,
    coords?.lng
  );

  const { data: initiatedData } = useGetInitiatedPlays(userId);

  const {
    cancelInvitation,
    status: cancelStatus,
    error: cancelerror,
  } = useCancelInvitation(refetch);

  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [selectedAction, setSelectedAction] = useState<
    'accept' | 'reject' | 'cancel' | null
  >(null);

  const [playerCounts, setPlayerCounts] = useState<{
    [key: string]: { accepted: number; total: number };
  }>({});
  const [playerDetailsVisible, setPlayerDetailsVisible] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]);
  const [inviteeName, setInviteeName] = useState<string | null>(null);

  // fetch accepted/total counts for all invites
  useEffect(() => {
    const fetchCounts = async () => {
      if (!eventsForSelectedDate) return;
      const newCounts: { [key: string]: { accepted: number; total: number } } =
        {};

      const allRequests = [
        ...(eventsForSelectedDate.incomingPlayerFinderRequests ?? []),
        ...(eventsForSelectedDate.initiatedPlayerFinderRequests ?? []),
      ];

      for (const req of allRequests) {
        try {
          const token = await getToken();
          const res = await axios.get(
            `${API_URL}/api/player-tracker/tracker/request`,
            {
              params: { requestId: req.requestId },
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const total = res.data[0]?.playersNeeded + 1 || 1;
          const accepted =
            res.data.filter((p: any) => p.status === 'ACCEPTED').length + 1;
          newCounts[req.requestId] = { accepted, total };
        } catch (error) {
          newCounts[req.requestId] = { accepted: 0, total: 1 };
        }
      }

      setPlayerCounts(newCounts);
    };

    fetchCounts();
  }, [eventsForSelectedDate]);

  // Filter initiated plays by selectedDate
  const initiatedPlaysForSelectedDate = (initiatedData ?? [])
    .filter(
      (e) => Array.isArray(e.startTime) && isSameDay(e.startTime, selectedDate)
    )
    .map((e) => ({
      ...e,
      type: 'available',
      start: parseArrayToDate(e.startTime),
      end: e.durationMinutes
        ? new Date(
            parseArrayToDate(e.startTime).getTime() + e.durationMinutes * 60000
          )
        : null,
    }));

  // Filter available events
  const availableEventsForSelectedDate = (
    eventsForSelectedDate?.eventsAvailable ?? []
  )
    .map((e) => ({
      ...e,
      type: 'available',
      start: parseArrayToDate(e.startTime),
      end: e.durationMinutes
        ? new Date(
            parseArrayToDate(e.startTime).getTime() + e.durationMinutes * 60000
          )
        : null,
    }))
    .filter((e) => isSameDay(e.startTime, selectedDate));

  // Unique/outgoing/incoming requests filtering
  const uniqueInitiatedPlayerFinderRequests = (
    eventsForSelectedDate?.initiatedPlayerFinderRequests ?? []
  ).filter(
    (req, index, self) =>
      index === self.findIndex((r) => r.requestId === req.requestId)
  );

  const allInitiatedPlayerFinderRequests =
    eventsForSelectedDate?.initiatedPlayerFinderRequests ?? [];

  // Function to group requests by requestId
  const groupedOutgoingRequests = (requests: any[]) => {
    const grouped = requests
      .filter((r) => r.status !== 'WITHDRAWN') // only active players
      .reduce((acc: Record<string, any[]>, curr) => {
        if (!acc[curr.requestId]) acc[curr.requestId] = [];
        acc[curr.requestId].push({
          ...curr,
          start: parseArrayToDate(curr.playTime),
          end: parseArrayToDate(curr.playEndTime),
          type: 'outgoing',
        });
        return acc;
      }, {});

    return Object.values(grouped).map((playersForRequest) => ({
      Requests: playersForRequest,
      accepted: playersForRequest.filter((r) => r.status === 'ACCEPTED').length,
      pending: playersForRequest.filter((r) => r.status === 'PENDING').length,
      date: playersForRequest[0].playTime
        ? format(
            parseArrayToDate(playersForRequest[0].playTime),
            'EEE, MMM d, h:mm a'
          )
        : null,
      dateTimeMs: playersForRequest[0].playTime
        ? parseArrayToDate(playersForRequest[0].playTime).getTime()
        : null,
      placeToPlay: playersForRequest[0].placeToPlay,
      playersNeeded: playersForRequest[0].playersNeeded,
      requestId: playersForRequest[0].requestId,
      skillRating: playersForRequest[0].skillRating,
      type: 'outgoing',
      start: playersForRequest[0].start,
      end: playersForRequest[0].end,
    }));
  };

  const outgoingRequests = groupedOutgoingRequests(
    allInitiatedPlayerFinderRequests
  );

  const incomingRequests = (
    eventsForSelectedDate?.incomingPlayerFinderRequests ?? []
  )
    .map((e) => ({
      ...e,
      type: 'incoming',
      start: parseArrayToDate(e.playTime),
      end: parseArrayToDate(e.playEndTime),
      accepted: playerCounts[e.requestId]?.accepted ?? 0,
      totalPlayers: playerCounts[e.requestId]?.total ?? 1,
    }))
    .filter((e) => isSameDay(e.playTime, selectedDate));

const registeredEventsForSelectedDate = (eventsForSelectedDate?.eventsRegistered ?? [])
  .map((e) => {
    const start = parseArrayToDate(e.startTime);
    return {
      ...e,
      type: 'registered',
      start,
      end: e.durationMinutes
        ? new Date(start.getTime() + e.durationMinutes * 60000)
        : null,
    };
  })
  .filter((e) => isSameDay(e.startTime, selectedDate));

// Filter waitlisted events for selected date
const waitlistedEventsForSelectedDate = (eventsForSelectedDate?.eventsWaitlisted ?? [])
  .map((e) => {
    const start = parseArrayToDate(e.startTime);
    return {
      ...e,
      type: 'waitlisted',
      start,
      end: e.durationMinutes
        ? new Date(start.getTime() + e.durationMinutes * 60000)
        : null,
    };
  })
  .filter((e) => isSameDay(e.startTime, selectedDate));

// Merge all events including waitlisted
const mergedEvents = [
  ...availableEventsForSelectedDate,
  ...registeredEventsForSelectedDate,
  ...waitlistedEventsForSelectedDate, // <--- added waitlisted here
  ...incomingRequests,
  ...outgoingRequests,
  ...initiatedPlaysForSelectedDate,
];
  const markedDates = useMemo(() => {
  const marks: Record<string, any> = {};
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const allEvents = [
    ...(schedule?.eventsAvailable ?? []).map(e => ({ ...e, type: 'eventsAvailable' })),
    ...(schedule?.incomingPlayerFinderRequests ?? []).map(e => ({ ...e, type: 'incomingPlayerFinder' })),
    ...(schedule?.initiatedPlayerFinderRequests ?? []).map(e => ({ ...e, type: 'initiatedPlayerFinder' })),
    ...(initiatedData ?? []).map(e => ({ ...e, type: 'initiatedPlay' })),
  ];

  const eventsByDate: Record<string, any[]> = {};
  allEvents.forEach(event => {
    const dateArr = event.startTime ?? event.playTime;
    if (!dateArr) return;
    const date = format(parseArrayToDate(dateArr), 'yyyy-MM-dd');
    if (!eventsByDate[date]) eventsByDate[date] = [];
    eventsByDate[date].push(event);
  });

  Object.entries(eventsByDate).forEach(([date, events]) => {
    if (date < todayStr) return;

    const isAccepted = (e: any) =>
      e.status === 'ACCEPTED' ||
      e.type === 'eventsAvailable' && Array.isArray(e.registeredPlayers) && e.registeredPlayers.includes(userId) ||
      e.type === 'initiatedPlayerFinder' ||
      e.type === 'initiatedPlay';

    let bgColor: string | null = null;

    if (events.every(isAccepted)) {
      bgColor = 'green';
    } else if (events.every(e => e.status === 'DECLINED')) {
      bgColor = 'red';
    } else {
      bgColor = '#b18a17ff'; // gold
    }

    if (bgColor) {
      marks[date] = {
        customStyles: {
          container: { backgroundColor: bgColor, borderRadius: 4 },
          text: { color: 'white', fontWeight: 'bold' },
        },
      };
    }
  });

  if (selectedDate) {
    marks[selectedDate] = {
      customStyles: {
        container: { backgroundColor: '#00adf5', borderRadius: 4 },
        text: { color: 'white', fontWeight: 'bold' },
      },
    };
  }

  return marks;
}, [schedule, initiatedData, selectedDate, userId]);

  const showCommentDialog = (
    invite: any,
    action: 'accept' | 'reject' | 'cancel'
  ) => {
    setSelectedInvite(invite);
    setSelectedAction(action);
    setDialogVisible(true);
    setComment('');
  };

  const handlePress = (event: any) => {
    if (event.type === 'outgoing') {
      const allPlayersForRequest = allInitiatedPlayerFinderRequests
        .filter(
          (e) => e.status !== 'WITHDRAWN' && e.requestId === event.requestId
        )
        .map((e) => ({
          ...e,
          type: 'outgoing',
          start: parseArrayToDate(e.playTime),
          end: parseArrayToDate(e.playEndTime),
        }));

      if (!allPlayersForRequest.length) return;

      const groupedOutgoingRequest = {
        Requests: allPlayersForRequest,
        accepted: allPlayersForRequest.filter((r) => r.status === 'ACCEPTED')
          .length,
        pending: allPlayersForRequest.filter((r) => r.status === 'PENDING')
          .length,
        date: allPlayersForRequest[0].playTime
          ? format(
              parseArrayToDate(allPlayersForRequest[0].playTime),
              'EEE, MMM d, h:mm a'
            )
          : null,
        dateTimeMs: allPlayersForRequest[0].playTime
          ? parseArrayToDate(allPlayersForRequest[0].playTime).getTime()
          : null,
        placeToPlay: allPlayersForRequest[0].placeToPlay,
        playersNeeded: allPlayersForRequest[0].playersNeeded,
        requestId: event.requestId,
        skillRating: allPlayersForRequest[0].skillRating,
      };

      const encoded = encodeURIComponent(
        JSON.stringify(groupedOutgoingRequest)
      );
      const disabled = isPastDate(event.start) ? 'true' : 'false';

      router.push({
        pathname: '/(authenticated)/sentRequestsDetailedView',
        params: { data: encoded, disabled: String(disabled) },
      });
    }
  };

  const handleDialogSubmit = async () => {
    if (!selectedInvite || !selectedAction) return;
    setDialogVisible(false);
    try {
      setLoadingId(selectedInvite.id);
      if (selectedAction === 'accept' || selectedAction === 'reject') {
        const oldUrl =
          selectedAction === 'accept'
            ? selectedInvite.acceptUrl
            : selectedInvite.declineUrl;

        const newBase = 'https://api.vddette.com';
        const urlObj = new URL(oldUrl);
        const newUrl = `${newBase}${urlObj.pathname}${
          urlObj.search
        }&comments=${encodeURIComponent(comment)}`;

        const response = await fetch(newUrl);
        if (response.status === 200) {
          Alert.alert('Success', `Invitation ${selectedAction}ed`);
          await refetch();
        } else {
          const errorText = await response.text();
          Alert.alert(
            'Error',
            errorText || `Failed to ${selectedAction} invitation.`
          );
        }
      } else if (selectedAction === 'cancel') {
        const ok = await cancelInvitation(
          selectedInvite.requestId,
          userId,
          comment || ''
        );
        if (ok) {
          Alert.alert('Success', 'Invitation cancelled');
        } else {
          Alert.alert('Error', cancelerror || 'Failed to cancel invitation');
        }
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
  const isPastDate = (dateArr: number[] | Date | null): boolean => {
    if (!dateArr) return false;
    const date = Array.isArray(dateArr)
      ? parseArrayToDate(dateArr)
      : new Date(dateArr);
    return date < new Date(new Date().setHours(0, 0, 0, 0)); // before today
  };

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
      if (res.data.length > 0) {
        setInviteeName(res.data[0].inviteeName || 'N/A');
      }
      setPlayerDetailsVisible(true);
      const total = res.data[0]?.playersNeeded + 1 || 1;
      const accepted =
        res.data.filter((p: any) => p.status === 'ACCEPTED').length + 1;

      // Update playerCounts state for this requestId
      setPlayerCounts((prevCounts) => ({
        ...prevCounts,
        [requestId]: { accepted, total },
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch player details');
    }
  };

  return (
    <PaperProvider>
      <View style={styles.Headercontainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace('/(authenticated)/home')}
            style={styles.backButton}
          >
            <Ionicons name='arrow-back' size={24} color='#cce5e3' />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Play Calendar</Text>
          </View>
          <UserAvatar size={30} />
        </View>

        <View style={styles.container}>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            markingType='custom'
            style={styles.calendar}
          />

          <FlatList
            data={mergedEvents}
            style={styles.smc}
            keyExtractor={(item, index) =>
              `${item.id || item.requestId}-${index}`
            }
            ListEmptyComponent={
              <Text style={styles.noEvents}>
                No confirmed events for this date
              </Text>
            }
            renderItem={({ item }) => {
              const safeStart = parseArrayToDate(item.start || item.startTime);

              if (item.type === 'incoming') {
                  return (
                    <InvitationCard
                      key={item.id}
                      invite={item}
                      onAccept={() => showCommentDialog(item, 'accept')}
                      onReject={() => showCommentDialog(item, 'reject')}
                      onCancel={() => showCommentDialog(item, 'cancel')}
                      loading={loadingId === item.id}
                      totalPlayers={item.totalPlayers}
                      acceptedPlayers={item.accepted}
                      onViewPlayers={() => handleViewPlayers(item.requestId)}
                    disabled={isPastDate(item.playTime)}
                    />
                  );
              } else if (item.type === 'outgoing') {
                // console.log('Rendering outgoing invite:', item);
                  return (
                    <TouchableOpacity onPress={() => handlePress(item)}>
                      <OutgoingInviteCardItem
                        key={item.requestId}
                        invite={item}
                        onViewPlayers={() => handleViewPlayers(item.requestId)}
                      disabled={isPastDate(item.start)}
                      />
                    </TouchableOpacity>
                  );
              } else if (item.type === 'available'|| item.type === 'registered'|| item.type === 'waitlisted') {
                  const start = item.start || parseArrayToDate(item.startTime);
                  console.log("hereeeeee",item)
                  const normalizedItem = {
                    id: item.id ?? '',
                    eventName: item.eventName ?? 'Unknown Event',
                    date: start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                    time: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    duration: item.durationMinutes ?? 0,
                    'skill level': item.skillLevel ?? 'N/A',
                    court: item.allCourts?.Name ?? 'N/A',
                    'max slots': item.maxPlayers ?? 0,
                    'filled slots': item.registeredPlayers?.length ?? 0,
                    action: item.type ?? 'N/A',
                    isFull: item.sessionFull ?? false,
                    priceForPlay: item.priceForPlay ?? 0,
                    isRegistered: item.registeredPlayers?.includes(userId) ?? false,
                    isWaitlisted: item.waitlistedPlayers?.includes(userId) ?? false,
                    initiated: item.type === 'initiated',
                  };
                  return (
                    <OpenPlayCard
                      data={[normalizedItem]}
                      refetch={() => {}}
                      disabled={isPastDate(start)}
                    />
                  );
              } else {
                  return (
                  <View style={styles.eventCard}>
                      <Text style={styles.eventTitle}>
                        {item.eventName || 'Event Name'}
                      </Text>
                      <Text style={styles.eventLocation}>
                      {item.placeToPlay ||
                        item.allCourts?.Name ||
                        'Unknown Location'}
                      </Text>
                      {item.start && item.end && (
                        <Text style={styles.eventTime}>
                        {format(item.start, 'h:mm a')} -{' '}
                        {format(item.end, 'h:mm a')}
                        </Text>
                      )}
                    </View>
                  );
              }
            }}
          />
        </View>

        <View style={styles.bottomNav}>
          <TouchableOpacity
            onPress={() => {
              const encodedSchedule = encodeURIComponent(
                JSON.stringify(schedule)
              );
              router.push({
                pathname: '/(authenticated)/set-availability',
                params: { data: encodedSchedule },
              });
            }}
          >
            <Text style={styles.navText}>Set Availability</Text>
          </TouchableOpacity>
        </View>

        <Portal>
          <Dialog
            visible={dialogVisible}
            onDismiss={() => setDialogVisible(false)}
          >
            <Dialog.Title>
              {selectedAction === 'cancel'
                ? 'Cancel Invitation'
                : 'Add a message'}
            </Dialog.Title>
            <Dialog.Content>
              <TextInput
                label={
                  selectedAction === 'cancel'
                    ? 'Cancel Reason (optional)'
                    : 'Comment (optional)'
                }
                value={comment}
                onChangeText={setComment}
                mode='outlined'
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
              <Button
                onPress={handleDialogSubmit}
                loading={cancelStatus === 'loading'}
                disabled={isPastDate(
                  selectedInvite?.startTime || selectedInvite?.playTime
                )}
              >
                Submit
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Portal>
          <Modal
            visible={playerDetailsVisible}
            onDismiss={() => setPlayerDetailsVisible(false)}
            contentContainerStyle={styles.bottomModal}
          >
            <ScrollView>
              <ScrollView contentContainerStyle={styles.dialogContent}>
                <PlayerDetailsModal
                  players={selectedPlayers}
                  inviteeName={inviteeName}
                />
              </ScrollView>
            </ScrollView>
          </Modal>
        </Portal>
      </View>
    </PaperProvider>
  );
}

// Existing styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  Headercontainer: {
    flex: 1,
    backgroundColor: '#2F7C83',
    borderBottomRightRadius: 25,
  },
  backButton: {
    paddingRight: 10,
    paddingVertical: 5,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    marginTop: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#0077cc',
    fontWeight: '500',
  },
  smc: {
    padding: 10,
  },

  calendar: {
    borderRadius: 12,
    margin: 16,
  },
  noEvents: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  eventCard: {
    backgroundColor: '#e6f2f8',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },
  eventTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  eventLocation: {
    fontSize: 14,
    color: '#555',
    marginVertical: 2,
  },
  eventTime: {
    fontSize: 14,
    color: '#333',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    backgroundColor: '#f9f9f9',
  },
  navText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0077cc',
  },
  bottomModal: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'white',
    padding: 20,
    elevation: 10,
    maxHeight: '90%',
    marginTop: 'auto',
    alignSelf: 'stretch',
  },
  dialogContent: {
    paddingBottom: 20,
  },
});
