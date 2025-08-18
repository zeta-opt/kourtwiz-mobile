import { useGetPlayerInvitationSent } from '@/hooks/apis/player-finder/useGetPlayerInivitationsSent';
import { useGetInvitations } from '@/hooks/apis/invitations/useGetInvitations';
import moment from 'moment';
import { RootState } from '@/store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import UserAvatar from '@/assets/UserAvatar';
import { router } from 'expo-router';

const HistoryPage = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const { data: incomingInvitations } = useGetInvitations({ userId: user?.userId });
    const { data: outgoingInvitations } = useGetPlayerInvitationSent({ inviteeEmail: user?.email });
    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);
    const [feedbackText, setFeedbackText] = useState('');

    const emojiList = ['emoticon-dead', 'emoticon-sad', 'emoticon-neutral', 'emoticon-happy', 'emoticon-excited'];

    const getColor = (status: string) => {
        switch (status.toUpperCase()) {
        case 'ACCEPTED': return '#327D85';
        case 'PENDING': return '#928E85';
        case 'DECLINED': return '#8B0000';
        default: return '#C76E00';
        }
    };
    
    const getIcon = (status: string) => {
        switch (status.toUpperCase()) {
        case 'ACCEPTED': return 'check-circle';
        case 'PENDING': return 'alert-circle';
        case 'DECLINED': return 'close-circle';
        default: return 'minus-circle';
        }
    };
    
    const getStatusLabel = (status: string) => {
        switch (status.toUpperCase()) {
        case 'ACCEPTED': return 'Played';
        case 'PENDING': return 'Expired';
        case 'DECLINED': return 'Rejected';
        default: return 'Withdrawn';
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
        return end instanceof Date && !isNaN(end.getTime()) && end.getTime() < Date.now();
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
    
        combined.forEach(inv => {
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
   

  return (
    <LinearGradient colors={['#E0F7FA', '#FFFFFF']} style={{ flex: 1 }}>
        <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.replace('/(authenticated)/home')}>
                <MaterialCommunityIcons name="arrow-left" size={22} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>History</Text>
            <TouchableOpacity onPress={() => router.replace('/(authenticated)/home')}>
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
                        <View style={[styles.cardInfo, {justifyContent: 'space-between', backgroundColor: '#F0F8FF', borderRadius: 6, padding: 6}]}>
                            <View>
                                <Text style={styles.titleText}>
                                    {inv.type === 'outgoing'
                                    ? `You invited ${inv.playersNeeded} ${inv.playersNeeded === 1 ? 'person' : 'people'}`
                                    : `${inv.inviteeName || 'Unknown'} invited you`}
                                </Text>
                                <View style={styles.cardInfo}>
                                <MaterialCommunityIcons name="map-marker" size={16} color='#327D85' style={{ marginRight: 8 }} />
                                    <Text style={[styles.subText, {color: '#327D85'}]}>
                                        {inv.placeToPlay || 'No location'}
                                    </Text>
                                </View>
                            </View>
                            <View style={[styles.cardInfo, { flexDirection: 'row', alignItems: 'center' }]}>
                                <Text style={[styles.subText, { color: getColor(inv.status) }]}>
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
                            <MaterialCommunityIcons name="calendar" size={16} color='gray' style={{ marginRight: 8 }} />
                            <Text style={styles.subText}>
                                {moment(toDate(inv.playTime)).format('MM/DD/YYYY')}
                            </Text>
                        </View>
                        <View style={styles.cardInfo}>
                            <MaterialCommunityIcons name="clock" size={16} color='gray' style={{ marginRight: 8 }} />
                            <Text style={styles.subText}>
                                {moment(toDate(inv.playTime)).format('hh:mm A')} - {moment(toDate(inv.playEndTime)).format('hh:mm A')}
                            </Text>
                        </View>
                        {/* Feedback Button */}
                        <TouchableOpacity
                            style={styles.feedbackButton}
                            onPress={() => setFeedbackVisible(true)}
                        >
                            <Text style={styles.feedbackButtonText}>Feedback</Text>
                        </TouchableOpacity>
                    </View>
                    ))}
                </View>
                ))
            )}
        </ScrollView>
        <Modal visible={feedbackVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>How was your experience?</Text>
                    <View style={styles.emojiRow}>
                        {emojiList.map((icon, index) => (
                        <TouchableOpacity key={index} onPress={() => setSelectedEmoji(index)}>
                            <MaterialCommunityIcons
                                name={icon}
                                size={30}
                                color={selectedEmoji === index ? '#327D85' : 'gray'}
                                style={{ marginHorizontal: 8 }}
                            />
                        </TouchableOpacity>
                        ))}
                    </View>

                    <TextInput
                        placeholder="Optional feedback..."
                        multiline
                        numberOfLines={3}
                        value={feedbackText}
                        onChangeText={setFeedbackText}
                        style={styles.feedbackInput}
                    />

                    <View style={styles.modalButtons}>
                        <Pressable onPress={() => setFeedbackVisible(false)} style={styles.modalButton}>
                        <Text style={styles.sendButton}>Send</Text>
                        </Pressable>
                        <Pressable onPress={() => setFeedbackVisible(false)} style={styles.modalButton}>
                        <Text style={styles.cancelButton}>Cancel</Text>
                        </Pressable>
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
    marginVertical: 5 
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },  
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  feedbackInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  sendButton: {
    color: '#327D85',
    fontWeight: 'bold',
  },
  cancelButton: {
    color: 'gray',
    fontWeight: 'bold',
  },  
});
