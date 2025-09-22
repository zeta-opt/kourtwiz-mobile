import UserAvatar from '@/assets/UserAvatar';
import { useSubmitGameFeedback } from '@/hooks/apis/game-feedback/useSubmitGameFeedback';
import { useGetPlayerSchedule } from '@/hooks/apis/set-availability/useGetPlayerSchedule';
import { RootState } from '@/store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import moment from 'moment';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { format, isBefore } from 'date-fns';

const parseArrayToDate = (arr?: number[]) =>
  arr ? new Date(arr[0], arr[1] - 1, arr[2], arr[3] || 0, arr[4] || 0) : null;

const HistoryPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: schedule, status, error } = useGetPlayerSchedule(user?.userId);
  const {
    submitGameFeedback,
    status: feedbackStatus,
    error: feedbackError,
    resetStatus,
  } = useSubmitGameFeedback();

  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const pastEvents = useMemo(() => {
    if (!schedule) return [];
  
    // Helper: remove duplicates by id
    const dedupeByKey = (arr: any[], key: string) => {
      const seen = new Map();
      arr.forEach((item) => {
        const uniqueKey = item[key];
        if (!seen.has(uniqueKey)) {
          seen.set(uniqueKey, item);
        }
      });
      return Array.from(seen.values());
    };
  
    const eventsAvailable = (schedule?.eventsAvailable ?? []).map((e:any) => ({
      ...e,
      type: 'eventAvailable',
      start: parseArrayToDate(e.startTime ?? e.playTime),
      end: e.durationMinutes
        ? new Date(parseArrayToDate(e.startTime ?? e.playTime)!.getTime() + e.durationMinutes * 60000)
        : parseArrayToDate(e.playEndTime),
      location: e.allCourts?.Name ?? e.placeToPlay,
      title: e.eventName ?? 'Pickleball Game',
      status: e.status ?? 'ACCEPTED',
    }));
  
    const eventsCreated = (schedule?.eventsCreated ?? []).map((e:any) => ({
      ...e,
      type: 'eventCreated',
      start: parseArrayToDate(e.startTime ?? e.playTime),
      end: e.durationMinutes
        ? new Date(parseArrayToDate(e.startTime ?? e.playTime)!.getTime() + e.durationMinutes * 60000)
        : parseArrayToDate(e.playEndTime),
      location: e.allCourts?.Name ?? e.placeToPlay,
      title: e.eventName ?? 'Pickleball Game',
      status: e.status ?? 'ACCEPTED',
    }));
  
    const incomingFinder = (schedule?.incomingPlayerFinderRequests ?? []).map((e:any) => ({
      ...e,
      type: 'incomingPlayerFinder',
      start: parseArrayToDate(e.startTime ?? e.playTime),
      end: parseArrayToDate(e.playEndTime),
      location: e.placeToPlay,
      title: `${e.inviteeName || 'Someone'} invited you`,
      status: e.status,
    }));
  
    const initiatedFinder = dedupeByKey(
      (schedule?.initiatedPlayerFinderRequests ?? []).map((e:any) => ({
        ...e,
        type: 'initiatedPlayerFinder',
        start: parseArrayToDate(e.startTime ?? e.playTime),
        end: parseArrayToDate(e.playEndTime),
        location: e.placeToPlay,
        title: `You invited ${e.playersNeeded} ${e.playersNeeded === 1 ? 'player' : 'players'}`,
        status: e.status,
        uniqueKey: e.requestId,
      })),
      'uniqueKey'
    );
  
    // Combine
    const allEvents = [...eventsAvailable, ...eventsCreated, ...incomingFinder, ...initiatedFinder];
  
    // Only past
    const now = new Date();
    const filtered = allEvents.filter((ev) => ev.start && isBefore(ev.start, now));
    
  // Group + sort stays the same
  const grouped = filtered.reduce((acc, ev) => {
    const dateKey = format(ev.start!, 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(ev);
    return acc;
  }, {} as Record<string, any[]>);

  return Object.entries(grouped)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([date, events]) => ({ date, events }));
  }, [schedule]);  

  if (status === 'loading')
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  if (status === 'error')
    return <Text style={{ color: 'red', margin: 20 }}>{error}</Text>;

  const emojiList = [
    'emoticon-dead',
    'emoticon-sad',
    'emoticon-neutral',
    'emoticon-happy',
    'emoticon-excited',
  ];

  const feedbackChips = [
    'Good communication',
    'Poor communication',
    'On time',
    'Late arrival',
    'Fair play',
    'Competitive',
    'Friendly',
    'No show',
  ];

  const getColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACCEPTED':
        return '#327D85';
      case 'PENDING':
        return '#928E85';
      case 'DECLINED':
        return '#8B0000';
      default:
        return '#C76E00';
    }
  };

  const getIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACCEPTED':
        return 'check-circle';
      case 'PENDING':
        return 'alert-circle';
      case 'DECLINED':
        return 'close-circle';
      default:
        return 'minus-circle';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACCEPTED':
        return 'Played';
      case 'PENDING':
        return 'Expired';
      case 'DECLINED':
        return 'Rejected';
      default:
        return 'Withdrawn';
    }
  };


  const handleFeedbackSubmit = async () => {
    // Validate that rating is selected
    if (selectedEmoji === null) {
      Alert.alert(
        'Rating Required',
        'Please select a rating before submitting.'
      );
      return;
    }

    try {
      const feedbackPayload = {
        gameId: selectedEvent?.id || '',
        playerId: user?.userId || '',
        opponentId: selectedEvent?.requestorId || selectedEvent?.inviteeId || '',
        date: selectedEvent?.playTime
          ? moment(normalizeDate(selectedEvent.playTime)).toISOString()
          : selectedEvent?.start
          ? moment(selectedEvent.start).toISOString()
          : '',
        startTime: selectedEvent?.playTime
          ? moment(normalizeDate(selectedEvent.playTime)).toISOString()
          : selectedEvent?.start
          ? moment(selectedEvent.start).toISOString()
          : '',
        endTime: selectedEvent?.playEndTime
          ? moment(normalizeDate(selectedEvent.playEndTime)).toISOString()
          : selectedEvent?.end
          ? moment(selectedEvent.end).toISOString()
          : '',
        location: selectedEvent?.location || '',
        rating: selectedEmoji + 1,
        positives: selectedChips,
        comments: feedbackText,
      };

      await submitGameFeedback(feedbackPayload);

      Alert.alert('Feedback Submitted', 'Thank you for your feedback!', [
        {
          text: 'OK',
          onPress: () => {
            setFeedbackVisible(false);
            setSelectedEmoji(null);
            setSelectedChips([]);
            setFeedbackText('');
            setSelectedEvent(null);
            resetStatus();
          },
        },
      ]);
    } catch {
      Alert.alert('Submission Failed', feedbackError || 'Please try again.', [
        { text: 'OK', onPress: () => resetStatus() },
      ]);
    }
  };

  const normalizeDate = (dateVal: any) => {
    if (!dateVal) return null;
    if (Array.isArray(dateVal)) {
      return parseArrayToDate(dateVal);
    }
    return new Date(dateVal); // handles ISO strings or timestamps
  };
  

  return (
    <LinearGradient colors={['#E0F7FA', '#FFFFFF']} style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.replace('/(authenticated)/home')}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <TouchableOpacity onPress={() => router.replace('/(authenticated)/home')}>
          <UserAvatar size={36} />
        </TouchableOpacity>
      </View>

      {/* Events */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {pastEvents.length === 0 ? (
          <Text style={styles.noData}>No past events found.</Text>
        ) : (
          pastEvents.map(({ date, events }) => {
            let formattedDate = '';
            const eventDate = moment(date);

            if (eventDate.isSame(moment(), 'day')) {
              formattedDate = 'Today';
            } else if (eventDate.isSame(moment().subtract(1, 'day'), 'day')) {
              formattedDate = 'Yesterday';
            } else {
              formattedDate = eventDate.format('MM/DD/YYYY');
            }

            return (
              <View key={date}>
                <Text style={styles.dateHeader}>{formattedDate}</Text>
                {events.map((ev:any) => (
                  <View key={ev.uniqueKey ?? ev.id} style={styles.cardContainer}>
                    <View
                      style={[
                        styles.cardInfo,
                        {
                          justifyContent: 'space-between',
                          backgroundColor: '#F0F8FF',
                          borderRadius: 6,
                          padding: 6,
                        },
                      ]}
                    >
                      <View>
                        <Text style={styles.titleText}>{ev.title}</Text>
                        <View style={styles.cardInfo}>
                          <MaterialCommunityIcons
                            name="map-marker"
                            size={16}
                            color="#327D85"
                            style={{ marginRight: 8 }}
                          />
                          <Text style={[styles.subText, { color: '#327D85' }]}>
                            {ev.location || 'No location'}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.cardInfo, { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap' }]}>
                        <Text 
                          style={[styles.subText, { color: getColor(ev.status), flexShrink: 1 }]}
                          numberOfLines={1} 
                          ellipsizeMode="tail"
                        >
                          {getStatusLabel(ev.status)}
                        </Text>
                        <MaterialCommunityIcons
                          name={getIcon(ev.status)}
                          size={18}
                          color={getColor(ev.status)}
                          style={{ marginLeft: 6 }}
                        />
                    </View>
                  </View>
                  <View style={styles.cardInfo}>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={16}
                      color="gray"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.subText}>{moment(ev.start).format('MM/DD/YYYY')}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <MaterialCommunityIcons
                      name="clock"
                      size={16}
                      color="gray"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.subText}>
                      {moment(ev.start).format('hh:mm A')} - {moment(ev.end).format('hh:mm A')}
                    </Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <MaterialCommunityIcons
                      name="wallet"
                      size={16}
                      color="gray"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.subText}>
                      {ev.priceForPlay != null ? `${ev.priceForPlay}$` : '0$'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.feedbackButton}
                    onPress={() => {
                      setSelectedEvent(ev);
                      setFeedbackVisible(true);
                    }}
                  >
                    <Text style={styles.feedbackButtonText}>Feedback</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })
      )}
      </ScrollView>

      {/* Enhanced Feedback Modal */}
      <Modal visible={feedbackVisible} transparent animationType='fade'>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate Your Game</Text>
              <Text style={styles.modalSubtitle}>
                Help us improve by sharing your experience
              </Text>
            </View>

            {/* Game Details Section */}
            {selectedEvent && (
              <View style={styles.gameDetailsSection}>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons
                    name='account'
                    size={20}
                    color='#327D85'
                    style={styles.detailIcon}
                  />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Played with:</Text>
                    <Text style={styles.detailValue}>
                      {selectedEvent.type === "initiatedPlayerFinder"
                        ? `${selectedEvent.playersNeeded} ${
                            selectedEvent.playersNeeded === 1 ? "person" : "people"
                          }`
                        : selectedEvent.type === "incomingPlayerFinder"
                        ? selectedEvent.inviteeName || "Unknown"
                        : selectedEvent.type === "eventCreated" ||
                          selectedEvent.type === "eventAvailable"
                        ? selectedEvent.registeredPlayers?.length > 0
                          ? `${selectedEvent.registeredPlayers.length} ${
                              selectedEvent.registeredPlayers.length === 1 ? "person" : "people"
                            }`
                          : selectedEvent.requestorName || "Unknown"
                        : "Unknown"}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <MaterialCommunityIcons
                    name='calendar'
                    size={20}
                    color='#327D85'
                    style={styles.detailIcon}
                  />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>
                    {moment(normalizeDate(selectedEvent.playTime ?? selectedEvent.start)).format('MMMM DD, YYYY')}
                  </Text>
                  </View>
                </View>

                <View style={[styles.detailRow, { marginBottom: 6 }]}>
                  <MaterialCommunityIcons
                    name='clock-outline'
                    size={20}
                    color='#327D85'
                    style={styles.detailIcon}
                  />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Time:</Text>
                    <Text style={styles.detailValue}>
                      {moment(normalizeDate(selectedEvent.playTime ?? selectedEvent.start)).format('h:mm A')} -{' '}
                      {moment(normalizeDate(selectedEvent.playEndTime ?? selectedEvent.end)).format('h:mm A')}
                    </Text>
                  </View>
                </View>

                <View style={[styles.detailRow, { marginBottom: 0 }]}>
                  <MaterialCommunityIcons
                    name='map-marker'
                    size={20}
                    color='#327D85'
                    style={styles.detailIcon}
                  />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Location:</Text>
                    <Text style={styles.detailValue}>
                      {selectedEvent.location || 'No location'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Feedback Content */}
            <ScrollView
              style={styles.feedbackContent}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.feedbackScrollContent}
            >
              {/* Emoji Rating Section */}
              <Text style={styles.sectionTitle}>How was your experience?</Text>
              <View style={styles.emojiRow}>
                {emojiList.map((icon, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedEmoji(index)}
                    style={[
                      styles.emojiButton,
                      selectedEmoji === index && styles.emojiButtonSelected,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
                      size={36}
                      color={selectedEmoji === index ? '#327D85' : '#999'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Quick Feedback Chips */}
              <Text style={styles.sectionTitle}>
                How would you describe this game?
              </Text>
              <View style={styles.chipsContainer}>
                {feedbackChips.map((chip, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedChips((prev) =>
                        prev.includes(chip)
                          ? prev.filter((c) => c !== chip)
                          : [...prev, chip]
                      );
                    }}
                    style={[
                      styles.chip,
                      selectedChips.includes(chip) && styles.chipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedChips.includes(chip) && styles.chipTextSelected,
                      ]}
                    >
                      {chip}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Comments Section */}
              <Text style={styles.sectionTitle}>Describe your experience</Text>
              <Text style={styles.sectionSubtitle}>
                Tell us more about your game, your opponent, or any suggestions
              </Text>
              <TextInput
                placeholder='Share any additional feedback about your game experience...'
                multiline
                numberOfLines={4}
                value={feedbackText}
                onChangeText={setFeedbackText}
                style={styles.feedbackTextInput}
                textAlignVertical='top'
              />
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setFeedbackVisible(false);
                  setSelectedEmoji(null);
                  setSelectedChips([]);
                  setFeedbackText('');
                  setSelectedEvent(null);
                  resetStatus();
                }}
                style={[styles.modalActionButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleFeedbackSubmit}
                style={[
                  styles.modalActionButton,
                  styles.submitButton,
                  feedbackStatus === 'loading' && { opacity: 0.7 },
                ]}
                disabled={feedbackStatus === 'loading'}
              >
                <Text style={styles.submitButtonText}>
                  {feedbackStatus === 'loading'
                    ? 'Submitting...'
                    : 'Submit Feedback'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default HistoryPage;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
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
    padding: 12,
    elevation: 3,
    marginBottom: 12,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginVertical: 10,
    color: '#555',
  },
  titleText: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: '#666',
  },
  feedbackButton: {
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#327D85',
  },
  feedbackButtonText: {
    color: '#327D85',
    fontWeight: '600',
  },

  // Enhanced Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    minHeight: 600,
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalHeader: {
    backgroundColor: '#327D85',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  gameDetailsSection: {
    backgroundColor: '#f8fbfd',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailIcon: {
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  feedbackContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  feedbackScrollContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  emojiButton: {
    padding: 8,
    borderRadius: 12,
  },
  emojiButtonSelected: {
    backgroundColor: '#e8f4f5',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f4f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#327D85',
    borderColor: '#327D85',
  },
  chipText: {
    fontSize: 13,
    color: '#666',
  },
  chipTextSelected: {
    color: '#fff',
  },

  feedbackTextInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f4f5',
  },
  submitButton: {
    backgroundColor: '#327D85',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
