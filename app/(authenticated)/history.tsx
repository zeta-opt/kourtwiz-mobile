import UserAvatar from '@/assets/UserAvatar';
import { useGetInvitations } from '@/hooks/apis/invitations/useGetInvitations';
import { useGetPlayerInvitationSent } from '@/hooks/apis/player-finder/useGetPlayerInivitationsSent';
import { RootState } from '@/store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import moment from 'moment';
import { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

const HistoryPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: incomingInvitations } = useGetInvitations({
    userId: user?.userId,
  });
  const { data: outgoingInvitations } = useGetPlayerInvitationSent({
    inviteeEmail: user?.email,
  });
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [selectedInvitation, setSelectedInvitation] = useState<any>(null);

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

  const toDate = (arr: number[] | string) => {
    if (Array.isArray(arr)) {
      const [y, m, d, h = 0, min = 0, s = 0] = arr;
      return new Date(y, m - 1, d, h, min, s);
    }
    return new Date(arr);
  };

  const isExpired = (playEnd: number[] | string) => {
    const end = toDate(playEnd);
    return (
      end instanceof Date && !isNaN(end.getTime()) && end.getTime() < Date.now()
    );
  };

  const expiredGroupedData = useMemo(() => {
    const formattedIncoming = (incomingInvitations ?? [])
      .filter((inv: any) => inv.playEndTime && isExpired(inv.playEndTime))
      .map((inv: any) => ({ ...inv, type: 'incoming' }));

    const formattedOutgoing = (outgoingInvitations ?? [])
      .filter((inv: any) => inv.playEndTime && isExpired(inv.playEndTime))
      .map((inv: any) => ({ ...inv, type: 'outgoing' }));

    const combined = [...formattedIncoming, ...formattedOutgoing];
    const grouped: Record<string, any[]> = {};

    combined.forEach((inv) => {
      const dateStr = moment(toDate(inv.playTime)).format('MM/DD/YYYY');
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(inv);
    });

    return Object.entries(grouped)
      .sort((a, b) =>
        moment(a[0], 'DD/MM/YYYY').isAfter(moment(b[0], 'MM/DD/YYYY')) ? -1 : 1
      )
      .map(([date, invites]) => ({ date, invites }));
  }, [incomingInvitations, outgoingInvitations]);

  const handleFeedbackSubmit = () => {
    // Handle feedback submission
    console.log({
      invitationId: selectedInvitation?.id,
      rating: selectedEmoji,
      chips: selectedChips,
      comments: feedbackText,
    });

    // TODO: Send feedback to your API endpoint
    // await submitFeedback({
    //   invitationId: selectedInvitation?.id,
    //   rating: selectedEmoji + 1, // Convert to 1-5 scale
    //   positiveAspects: selectedChips,
    //   comments: feedbackText,
    // });

    // Reset and close
    setFeedbackVisible(false);
    setSelectedEmoji(null);
    setSelectedChips([]);
    setFeedbackText('');
    setSelectedInvitation(null);
  };

  return (
    <LinearGradient colors={['#E0F7FA', '#FFFFFF']} style={{ flex: 1 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.replace('/(authenticated)/home')}
        >
          <MaterialCommunityIcons name='arrow-left' size={22} color='black' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <TouchableOpacity
          onPress={() => router.replace('/(authenticated)/home')}
        >
          <UserAvatar size={36} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {expiredGroupedData.length === 0 ? (
          <Text style={styles.noData}>No expired invitations found.</Text>
        ) : (
          expiredGroupedData.map(({ date, invites }) => (
            <View key={date}>
              <Text style={styles.dateHeader}>{date}</Text>
              {invites.map((inv, idx) => (
                <View key={idx} style={styles.cardContainer}>
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
                      <Text style={styles.titleText}>
                        {inv.type === 'outgoing'
                          ? `You invited ${inv.playersNeeded} ${
                              inv.playersNeeded === 1 ? 'person' : 'people'
                            }`
                          : `${inv.inviteeName || 'Unknown'} invited you`}
                      </Text>
                      <View style={styles.cardInfo}>
                        <MaterialCommunityIcons
                          name='map-marker'
                          size={16}
                          color='#327D85'
                          style={{ marginRight: 8 }}
                        />
                        <Text style={[styles.subText, { color: '#327D85' }]}>
                          {inv.placeToPlay || 'No location'}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.cardInfo,
                        { flexDirection: 'row', alignItems: 'center' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.subText,
                          { color: getColor(inv.status) },
                        ]}
                      >
                        {getStatusLabel(inv.status)}
                      </Text>
                      <MaterialCommunityIcons
                        name={getIcon(inv.status)}
                        size={18}
                        color={getColor(inv.status)}
                        style={{ marginRight: 6, marginLeft: 6 }}
                      />
                    </View>
                  </View>
                  <View style={styles.cardInfo}>
                    <MaterialCommunityIcons
                      name='calendar'
                      size={16}
                      color='gray'
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.subText}>
                      {moment(toDate(inv.playTime)).format('MM/DD/YYYY')}
                    </Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <MaterialCommunityIcons
                      name='clock'
                      size={16}
                      color='gray'
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.subText}>
                      {moment(toDate(inv.playTime)).format('hh:mm A')} -{' '}
                      {moment(toDate(inv.playEndTime)).format('hh:mm A')}
                    </Text>
                  </View>
                  {/* Feedback Button */}
                  <TouchableOpacity
                    style={styles.feedbackButton}
                    onPress={() => {
                      setSelectedInvitation(inv);
                      setFeedbackVisible(true);
                    }}
                  >
                    <Text style={styles.feedbackButtonText}>Feedback</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))
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
            {selectedInvitation && (
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
                      {selectedInvitation.type === 'outgoing'
                        ? `${selectedInvitation.playersNeeded} ${
                            selectedInvitation.playersNeeded === 1
                              ? 'person'
                              : 'people'
                          }`
                        : selectedInvitation.inviteeName || 'Unknown'}
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
                      {moment(toDate(selectedInvitation.playTime)).format(
                        'MMMM DD, YYYY'
                      )}
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
                      {moment(toDate(selectedInvitation.playTime)).format(
                        'h:mm A'
                      )}{' '}
                      -{' '}
                      {moment(toDate(selectedInvitation.playEndTime)).format(
                        'h:mm A'
                      )}
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
                      {selectedInvitation.placeToPlay || 'No location'}
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
                      name={icon}
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
                  setSelectedInvitation(null);
                }}
                style={[styles.modalActionButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleFeedbackSubmit}
                style={[styles.modalActionButton, styles.submitButton]}
              >
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
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
