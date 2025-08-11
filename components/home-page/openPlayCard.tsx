import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useGetClubCourt } from '@/hooks/apis/courts/useGetClubCourts';
import { useMutateJoinPlay } from '@/hooks/apis/join-play/useMutateJoinPlay';
import { useWithdrawFromPlay } from '@/hooks/apis/join-play/useWithdrawFromPlay';
import { useWithdrawFromWaitlist } from '@/hooks/apis/join-play/useWithdrawFromWaitlist';
import { useGetInitiatedPlays } from '@/hooks/apis/join-play/useGetInitiatedPlays';
import LoaderScreen from '@/shared/components/Loader/LoaderScreen';
import { RootState } from '@/store';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Button, Text } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';

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
  initiated: boolean;
  [key: string]: any;
};

type OpenPlayCardProps = {
  cardStyle?: ViewStyle;
  data: any[];
  refetch: () => void;
};

const extractErrorMessage = (err: any): string => {
  return (
    err?.response?.data?.message ||
    (typeof err?.response?.data === 'string' ? err.response.data : null) ||
    err?.message ||
    'Unknown error occurred'
  );
};

const OpenPlayCard: React.FC<OpenPlayCardProps> = ({ cardStyle, data, refetch }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const clubId = user?.currentActiveClubId || 'GLOBAL';
  const userId = user?.userId;

  // Get initiated plays
  const { data: initiatedData, status: initiatedStatus } = useGetInitiatedPlays(userId);

  const { data: courtsData, status: courtsStatus } = useGetClubCourt({ clubId });
  const { joinPlaySession } = useMutateJoinPlay();
  const { withdraw } = useWithdrawFromPlay();
  const { withdrawFromWaitlist } = useWithdrawFromWaitlist();

  const [rows, setRows] = useState<PlayRow[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleJoinPlay = async (
    id: string,
    isFull: boolean,
    isRegistered: boolean,
    isWaitlisted: boolean
  ) => {
    setLoadingId(id);

    if (isWaitlisted) {
      try {
        await withdrawFromWaitlist({ sessionId: id, userId });
        Toast.show({ type: 'success', text1: 'Withdrawn from waitlist', topOffset: 100 });
        refetch();
        setRows(prev => prev.map(r => r.id === id ? { ...r, isWaitlisted: false } : r));
      } catch (err) {
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
      try {
        await withdraw({ sessionId: id, userId });
        Toast.show({ type: 'success', text1: 'Withdrawn from play', topOffset: 100 });
        refetch();
        setRows(prev => prev.map(r => r.id === id ? { ...r, isRegistered: false, 'filled slots': Math.max(0, r['filled slots'] - 1) } : r));
      } catch (err) {
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

    await joinPlaySession({
      userId,
      sessionId: id,
      callbacks: {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: isFull ? 'Joined waitlist' : 'Joined play',
            topOffset: 100,
          });
          refetch();
          setRows(prev =>
            prev.map(r =>
              r.id === id
                ? { ...r, isRegistered: !isFull, isWaitlisted: isFull, 'filled slots': !isFull ? r['filled slots'] + 1 : r['filled slots'] }
                : r
            )
          );
          setLoadingId(null);
        },
        onError: (error) => {
          Toast.show({ type: 'error', text1: 'Unable to join', text2: error.message, topOffset: 100 });
          setLoadingId(null);
        },
      },
    });
  };

  const buttonMessage = (
    isRegistered: boolean,
    isWaitlisted: boolean,
    isFull: boolean
  ): string => {
    if (isWaitlisted) return 'Withdraw from waitlist';
    if (isRegistered) return 'Withdraw';
    if (!isRegistered && isFull && !isWaitlisted) return 'Join Waitlist';
    return 'Register';
  };

  useEffect(() => {
    if (!data || (clubId !== 'GLOBAL' && (!courtsData || courtsData.length === 0))) {
      return;
    }

    // Merge and mark initiated plays
    let allPlays = [...data.map(p => ({ ...p, initiated: false }))];
    if (initiatedData && Array.isArray(initiatedData)) {
      const existingIds = new Set(allPlays.map(p => p.id));
      const extra = initiatedData
        .filter(p => !existingIds.has(p.id))
        .map(p => ({ ...p, initiated: true }));
      allPlays = [...allPlays, ...extra];
    }

    const courtMap: Record<string, string> = {};
    if (clubId !== 'GLOBAL') {
      courtsData?.forEach((court: any) => {
        courtMap[court.id] = court.name;
      });
    }

    const mappedRows = allPlays.map((play: any) => {
      const startDate = new Date(
        play.startTime[0],
        play.startTime[1] - 1,
        play.startTime[2],
        play.startTime[3] || 0,
        play.startTime[4] || 0
      );

      const courtName =
        clubId !== 'GLOBAL'
          ? play.courtId
            ? courtMap[play.courtId] || play.allCourts?.Name || 'N/A'
            : play.allCourts?.Name || 'N/A'
          : play.allCourts?.Name || 'N/A';

      const registeredPlayers = play.registeredPlayers || [];
      const waitlistedPlayers = play.waitlistedPlayers || [];

      const isRegistered = registeredPlayers.includes(userId);
      const isWaitlisted = waitlistedPlayers.includes(userId);
      const filledSlots = registeredPlayers.length;
      const isFull = filledSlots >= play.maxPlayers + 1;

      return {
        id: play.id,
        initiated: play.initiated || false,
        'event name': play.eventName?.split('_').join(' ').toLowerCase() || 'Unknown Event',
        date: startDate.toLocaleDateString(),
        time: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: play.durationMinutes,
        'skill level': play.skillLevel,
        court: courtName,
        'max slots': play.maxPlayers + 1,
        'filled slots': filledSlots,
        action: play.playTypeName?.split('_').join(' ').toLowerCase(),
        isFull,
        priceForPlay: play.priceForPlay || 0,
        isRegistered,
        isWaitlisted,
      };
    });

    setRows(mappedRows);
  }, [data, initiatedData, courtsData, userId, clubId]);

  if (!clubId) {
    return <Text style={styles.noDataText}>No open play sessions available</Text>;
  }
  if (courtsStatus === 'loading' || initiatedStatus === 'loading') {
    return <LoaderScreen />;
  }
  if (rows.length === 0) {
    return <Text style={styles.noDataText}>No open play sessions available</Text>;
  }

  return (
    <View>
      {rows.map((row) => (
        <TouchableOpacity
          key={row.id}
          style={[styles.card, cardStyle]}
          onPress={() => {
            router.push({
              pathname: '/(authenticated)/openPlayDetailedView',
              params: { sessionId: row.id },
            });
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
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
            <View style={[styles.statusBadge, { flexDirection: 'row', alignItems: 'center' }]}>
              <MaterialIcons name="person" size={16} color="#2F7C83" style={{ marginRight: 4 }} />
              <Text style={styles.statusBadgeText}>
                {row['filled slots']}/{row['max slots']} Accepted
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                <MaterialCommunityIcons
                  name="wallet"
                  size={16}
                  color="#2F7C83"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.priceText}>${row.priceForPlay.toFixed(2)}</Text>
              </View>
            </View>
            <Button
              mode="contained"
              onPress={() =>
                handleJoinPlay(row.id, row.isFull, row.isRegistered, row.isWaitlisted)
              }
              style={[
                styles.button,
                row.isWaitlisted && styles.waitlistWithdrawButton,
                row.isRegistered && styles.withdrawButton,
                !row.isRegistered && row.isFull && !row.isWaitlisted && styles.joinWaitlistButton,
              ]}
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
              {buttonMessage(row.isRegistered, row.isWaitlisted, row.isFull)}
            </Button>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 6,
  },
  placeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 6,
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
    marginTop: 4,
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
    marginTop: 10,
  },
  button: {
    backgroundColor: '#2F7C83',
    borderRadius: 6,
    height: 36,
    justifyContent: 'center',
  },
  buttonContent: { height: 36, paddingHorizontal: 12 },
  buttonLabel: { fontSize: 12, fontWeight: 'bold', color: '#FFFFFF' },
  noDataText: {
    textAlign: 'center',
    color: '#000000',
    fontSize: 14,
    paddingVertical: 20,
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
