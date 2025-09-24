import { useGetClubCourt } from '@/hooks/apis/courts/useGetClubCourts';
import { useCancelOpenPlay } from '@/hooks/apis/join-play/useCancelOpenPlay';
import { useMutateJoinPlay } from '@/hooks/apis/join-play/useMutateJoinPlay';
import { useWithdrawFromPlay } from '@/hooks/apis/join-play/useWithdrawFromPlay';
import { useWithdrawFromWaitlist } from '@/hooks/apis/join-play/useWithdrawFromWaitlist';
import LoaderScreen from '@/shared/components/Loader/LoaderScreen';
import { RootState } from '@/store';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Button, Text } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';

type PlayRow = {
  id: string;
  date: string;
  time: string;
  duration: number;
  'skill level': string;
  court: string;
  'max slots': number;
  'filled slots': number;
  action: string;
  isFull: boolean;
  isRegistered: boolean;
  isWaitlisted: boolean;
  priceForPlay: number;
  'event name': string;
  [key: string]: any;
};

type OpenPlayCardProps = {
  cardStyle?: ViewStyle;
  data: any[];
  refetch: () => void;
  disabled?: boolean;
};
const extractErrorMessage = (err: any): string => {
  return (
    err?.response?.data?.message ||
    (typeof err?.response?.data === 'string' ? err.response.data : null) ||
    err?.message ||
    'Unknown error occurred'
  );
};

const OpenPlayCard: React.FC<OpenPlayCardProps> = ({
  cardStyle,
  data,
  refetch,
  disabled = false,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const clubId = user?.currentActiveClubId || 'GLOBAL';
  const userId = user?.userId;

  const { data: courtsData, status: courtsStatus } = useGetClubCourt({ clubId });
  const { joinPlaySession } = useMutateJoinPlay();
  const { withdraw } = useWithdrawFromPlay();
  const { withdrawFromWaitlist } = useWithdrawFromWaitlist();
  const [rows, setRows] = useState<PlayRow[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const optimisticUpdates = useRef<Map<string, Partial<PlayRow>>>(new Map());
  const pendingActions = useRef<Set<string>>(new Set());
    useEffect(() => {
      if (!Array.isArray(data) || data.length === 0) {
        setRows([]);
        return;
      }

      const mappedRows: PlayRow[] = data.map((play: any) => {
        console.log("play", play);

        return {
          id: play.id ?? '',
          'event name': play.eventName ?? 'Unknown Event',
          date: play.date,
          time: play.time,
          duration: play.duration ?? 0,
          'skill level': play.skillLevel ?? 'N/A',
          court: play.court ?? 'N/A',
          'max slots': (play.playersNeeded ?? 0) + (play.accepted ?? 0),
          'filled slots': play.accepted ?? 0,
          action: play.type ?? 'N/A',
          isFull: play.isFull ?? false,
          priceForPlay: play.priceForPlay ?? 0,
          isRegistered: play.isRegistered ?? false,
          isWaitlisted: play.isWaitlisted ?? false,
          initiated: play.type === 'initiated',
        };
      });

      setRows(mappedRows);
    }, [data]);




  const { cancel } = useCancelOpenPlay();


  const handleCancelInitiatedPlay = async (id: string) => {
    Alert.alert(
      'Cancel Event',
      'Are you sure you want to cancel this event? This cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setLoadingId(id);
            try {
              await cancel({ sessionId: id });
              Toast.show({
                type: 'success',
                text1: 'Event canceled successfully',
                topOffset: 100,
              });
              await refetch();
            } catch (err) {
              Toast.show({
                type: 'error',
                text1: 'Failed to cancel event',
                text2: extractErrorMessage(err),
                topOffset: 100,
              });
            } finally {
              setLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const handleJoinPlay = async (
    id: string,
    isFull: boolean,
    isRegistered: boolean,
    isWaitlisted: boolean,
    initiated: boolean
  ) => {
    if (initiated) {
      return handleCancelInitiatedPlay(id);
    }

    setLoadingId(id);
    pendingActions.current.add(id);

    if (isWaitlisted) {
      const update = { isWaitlisted: false };
      optimisticUpdates.current.set(id, update);
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...update } : r))
      );

      try {
        await withdrawFromWaitlist({ sessionId: id, userId });
        Toast.show({
          type: 'success',
          text1: 'Withdrawn from waitlist',
          topOffset: 100,
        });
        await refetch();
        setTimeout(() => {
          optimisticUpdates.current.delete(id);
          pendingActions.current.delete(id);
        }, 1000);
      } catch (err) {
        optimisticUpdates.current.delete(id);
        pendingActions.current.delete(id);
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isWaitlisted: true } : r))
        );
        Toast.show({
          type: 'error',
          text1: 'Failed to withdraw from waitlist',
          text2: extractErrorMessage(err),
          topOffset: 100,
        });
      } finally {
        setLoadingId(null);
      }
      return;
    }

    if (isRegistered) {
      const currentRow = rows.find((r) => r.id === id)!;
      const update = {
        isRegistered: false,
        'filled slots': Math.max(0, currentRow['filled slots'] - 1),
      };
      optimisticUpdates.current.set(id, update);
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...update } : r))
      );

      try {
        await withdraw({ sessionId: id, userId });
        Toast.show({
          type: 'success',
          text1: 'Withdrawn from play',
          topOffset: 100,
        });
        await refetch();
        setTimeout(() => {
          optimisticUpdates.current.delete(id);
          pendingActions.current.delete(id);
        }, 1000);
      } catch (err) {
        optimisticUpdates.current.delete(id);
        pendingActions.current.delete(id);
        setRows((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  isRegistered: true,
                  'filled slots': currentRow['filled slots'],
                }
              : r
          )
        );
        Toast.show({
          type: 'error',
          text1: 'Failed to withdraw',
          text2: extractErrorMessage(err),
          topOffset: 100,
        });
      } finally {
        setLoadingId(null);
      }
      return;
    }

    const currentRow = rows.find((r) => r.id === id)!;
    const newIsRegistered = !isFull;
    const newIsWaitlisted = isFull;
    const newFilledSlots = !isFull
      ? currentRow['filled slots'] + 1
      : currentRow['filled slots'];

    const update = {
      isRegistered: newIsRegistered,
      isWaitlisted: newIsWaitlisted,
      'filled slots': newFilledSlots,
      isFull: newFilledSlots >= currentRow['max slots'],
    };
    optimisticUpdates.current.set(id, update);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...update } : r)));

    await joinPlaySession({
      userId,
      sessionId: id,
      callbacks: {
        onSuccess: async () => {
          Toast.show({
            type: 'success',
            text1: isFull ? 'Joined waitlist' : 'Joined play',
            topOffset: 100,
          });
          await refetch();
          setTimeout(() => {
            optimisticUpdates.current.delete(id);
            pendingActions.current.delete(id);
          }, 1000);
          setLoadingId(null);
        },
        onError: (error) => {
          optimisticUpdates.current.delete(id);
          pendingActions.current.delete(id);
          setRows((prev) =>
            prev.map((r) =>
              r.id === id
                ? {
                    ...r,
                    isRegistered: false,
                    isWaitlisted: false,
                    'filled slots': currentRow['filled slots'],
                    isFull: currentRow.isFull,
                  }
                : r
            )
          );
          Toast.show({
            type: 'error',
            text1: 'Unable to join',
            text2: error.message,
            topOffset: 100,
          });
          setLoadingId(null);
        },
      },
    });
  };

  const buttonMessage = (
    isRegistered: boolean,
    isWaitlisted: boolean,
    isFull: boolean,
    initiated: boolean
  ): string => {
    if (initiated) return 'Cancel';
    if (isWaitlisted) return 'Withdraw from waitlist';
    if (isRegistered) return 'Withdraw';
    if (!isRegistered && isFull && !isWaitlisted) return 'Join Waitlist';
    return 'Register';
  };

  if (courtsStatus === 'loading') return <LoaderScreen />;
  if (rows.length === 0)
  return <Text style={styles.noDataText}>No open play sessions available</Text>;
  return (
    <View>
      {rows.map((row) => (
        <TouchableOpacity
          key={row.id}
          style={[styles.card]}
          onPress={() => {
            router.push({
              pathname: '/(authenticated)/openPlayDetailedView',
              params: { sessionId: row.id, disabled: String(disabled) },
            });
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Text style={styles.placeText} numberOfLines={1}>
              {row['event name']}
            </Text>
            {row.initiated && (
              <View style={styles.initiatedBadge}>
                <Text style={styles.initiatedBadgeText}>Initiated by Me</Text>
              </View>
            )}
          </View>

          <View style={styles.datePeopleRow}>
            <Text style={styles.dateText}>
              {row.date} | {row.time}
            </Text>
            <Text style={styles.separator}>|</Text>
            <Text style={styles.peopleText}>{row.court}</Text>
          </View>
          <View style={styles.rowBetween}>
            <View
              style={[
                styles.statusBadge,
                { flexDirection: 'row', alignItems: 'center' },
              ]}
            >
              <MaterialIcons
                name='person'
                size={16}
                color='#2F7C83'
                style={{ marginRight: 4 }}
              />
              <Text style={styles.statusBadgeText}>
                {row['filled slots']}/{row['max slots']} Accepted
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 10,
                }}
              >
                <MaterialCommunityIcons
                  name='wallet'
                  size={16}
                  color='#2F7C83'
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.priceText}>
                  ${row.priceForPlay.toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => {
                  if (row.isRegistered) {
                    router.push({
                      pathname: '/(authenticated)/chat-summary',
                      params: { sessionId: row.id },
                    });
                  } else {
                    Toast.show({
                      type: 'info',
                      text1: 'Register to chat with players',
                      topOffset: 100,
                    });
                  }
                }}
              >
                <MaterialCommunityIcons
                  name='message-text-outline'
                  size={18}
                  color='#2C7E88'
                />
              </TouchableOpacity>
            </View>
            <Button
              mode='contained'
              onPress={() =>
                handleJoinPlay(
                  row.id,
                  row.isFull,
                  row.isRegistered,
                  row.isWaitlisted,
                  row.initiated
                )
              }
              style={[
                styles.button,
                { maxWidth: 120 },
                row.initiated && styles.cancelButton,
                row.isWaitlisted && styles.waitlistWithdrawButton,
                row.isRegistered && styles.withdrawButton,
                !row.isRegistered &&
                  row.isFull &&
                  !row.isWaitlisted &&
                  styles.joinWaitlistButton,
                disabled && styles.disabledButton,
              ]}
              disabled={disabled}
              loading={row.id === loadingId}
              contentStyle={[
                styles.buttonContent,
                row.isWaitlisted && styles.longTextContent,
              ]}
              labelStyle={[
                styles.buttonLabel,
                row.isWaitlisted && styles.longTextLabel,
              ]}
            >
              {buttonMessage(
                row.isRegistered,
                row.isWaitlisted,
                row.isFull,
                row.initiated
              )}
            </Button>
          </View>
        </TouchableOpacity>
        
      ))}
      <View style={styles.horizontalLine2} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
     marginBottom: 10,
      borderBottomWidth: 1,
    borderBottomColor: '#eee',
     paddingBottom: 6,
     marginTop: 6,
  },
  placeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    // marginTop: 6,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF', // greyed out
  },
  initiatedBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  initiatedBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  datePeopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dateText: { fontSize: 13, color: '#4B5563' },
  separator: { marginHorizontal: 6, color: '#9CA3AF' },
  peopleText: { fontSize: 13, color: '#4B5563' },
  statusBadge: {
    borderRadius: 6,
    backgroundColor: '#E0F7FA',
    height: 35,
    justifyContent: 'space-between',
    padding: 6,
  },
  statusBadgeText: { color: '#000000', fontSize: 12 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 7,
  },
  button: {
    backgroundColor: '#2F7C83',
    borderRadius: 6,
    height: 28,
    justifyContent: 'center',
    maxWidth: '100%', 
  },
  cancelButton: {
    backgroundColor: '#B00020',
  },
  horizontalLine2: {
  borderBottomColor: '#ccc',
  borderBottomWidth: 1.05,
  // marginTop: 4,   
  // width: '100%',
  marginHorizontal: -16,
},
  buttonContent: { height: 36, paddingHorizontal: 8 },
  buttonLabel: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF',flexShrink: 1,overflow: 'hidden', },
  noDataText: {
    textAlign: 'center',
    color: '#000000',
    fontSize: 14,
    paddingVertical: 20,
  },
  chatButton: {
    backgroundColor: '#E0F7FA',
    borderRadius: 20,
    padding: 4,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
  },

  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  withdrawButton: {
    backgroundColor: '#D32F2F',
  },
  waitlistWithdrawButton: {
    backgroundColor: '#D32F2F',
  },
  joinWaitlistButton: {
    backgroundColor: '#F6C90E',
  },
  longTextContent: {
    height: 36,
    paddingHorizontal: 2,
  },
  longTextLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default OpenPlayCard;
