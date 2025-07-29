// OpenPlayCard.tsx
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useGetClubCourt } from '@/hooks/apis/courts/useGetClubCourts';
import { useGetPlays } from '@/hooks/apis/join-play/useGetPlays';
import { useMutateJoinPlay } from '@/hooks/apis/join-play/useMutateJoinPlay';
import { useWithdrawFromPlay } from '@/hooks/apis/join-play/useWithdrawFromPlay';
import { useWithdrawFromWaitlist } from '@/hooks/apis/join-play/useWithdrawFromWaitlist';
import LoaderScreen from '@/shared/components/Loader/LoaderScreen';
import { RootState } from '@/store';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
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
};

const OpenPlayCard: React.FC<OpenPlayCardProps> = ({ cardStyle }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const clubId = user?.currentActiveClubId || 'GLOBAL';
  const userId = user?.userId;

  const { data: playsData, status, refetch } = useGetPlays(clubId, userId);
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

    // Withdraw from waitlist
    if (isWaitlisted) {
      try {
        await withdrawFromWaitlist({ sessionId: id, userId });

        Toast.show({
          type: 'success',
          text1: 'Withdrawn from waitlist',
          topOffset: 100,
        });

        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === id ? { ...row, isWaitlisted: false } : row
          )
        );
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Failed to withdraw from waitlist',
          topOffset: 100,
        });
      } finally {
        setLoadingId(null);
        refetch();
      }
      return;
    }

    // Withdraw from registered play
    if (isRegistered) {
      try {
        await withdraw({ sessionId: id, userId });

        Toast.show({
          type: 'success',
          text1: 'Withdrawn from play',
          topOffset: 100,
        });

        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === id ? { ...row, isRegistered: false } : row
          )
        );
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Failed to withdraw',
          topOffset: 100,
        });
      } finally {
        setLoadingId(null);
        refetch();
      }
      return;
    }

    // Register or join waitlist
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

          setRows((prevRows) =>
            prevRows.map((row) =>
              row.id === id
                ? {
                    ...row,
                    isRegistered: !isFull,
                    isWaitlisted: isFull,
                  }
                : row
            )
          );

          setLoadingId(null);
          refetch();
        },
        onError: () => {
          Toast.show({
            type: 'error',
            text1: 'Unable to join',
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
    isFull: boolean
  ): string => {
    if (isWaitlisted) return 'Withdraw from waitlist';
    if (isRegistered) return 'Withdraw';
    if (!isRegistered && isFull && !isWaitlisted) return 'Join Waitlist';
    return 'Register';
  };

  useEffect(() => {
    if (
      !playsData ||
      playsData.length === 0 ||
      (clubId !== 'GLOBAL' && (!courtsData || courtsData.length === 0))
    ) {
      return;
    }

    const courtMap: Record<string, string> = {};
    if (clubId !== 'GLOBAL' && courtsData?.length) {
      courtsData.forEach((data: any) => {
        courtMap[data.id] = data.name;
      });
    }

    const dataRows = playsData.map((play: any) => {
      const startDate = new Date(
        play.startTime[0],
        play.startTime[1] - 1,
        play.startTime[2],
        play.startTime[3],
        play.startTime[4]
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

      const filledSlots = registeredPlayers.length - 1;
      const isFull = filledSlots >= play.maxPlayers;

      return {
        id: play.id,
        'event name':
          play.eventName?.split('_').join(' ').toLowerCase() || 'Unknown Event',
        date: startDate.toLocaleDateString(),
        time: startDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        duration: play.durationMinutes,
        'skill level': play.skillLevel,
        court: courtName,
        'max slots': play.maxPlayers,
        'filled slots': filledSlots,
        action: play.playTypeName?.split('_').join(' ').toLowerCase(),
        isFull,
        priceForPlay: play.priceForPlay || 0,
        isRegistered,
        isWaitlisted,
      };
    });

    setRows(dataRows);
  }, [clubId, playsData, courtsData, userId, status, courtsStatus]);

  if (!clubId) {
    return <Text style={styles.noDataText}>No open play sessions available</Text>;
  }

  if (status === 'loading' || courtsStatus === 'loading') {
    return <LoaderScreen />;
  }

  if (rows.length === 0) {
    return <Text style={styles.noDataText}>No open play sessions available</Text>;
  }

  return (
    <View>
      {rows.map((row) => (
        <View key={row.id} style={[styles.card, cardStyle]}>
          <Text style={styles.placeText} numberOfLines={1}>
            {row['event name']}
          </Text>
          <View style={styles.datePeopleRow}>
            <Text style={styles.dateText}>
              {row.date} | {row.time}
            </Text>
            <Text style={styles.separator}>|</Text>
            <Text style={styles.peopleText}>{row.court}</Text>
          </View>
          <View style={styles.rowBetween}>
            <View style={[styles.statusBadge, { flexDirection: 'row', alignItems: 'center' }]}>
              <MaterialIcons
                name="person"
                size={16}
                color="#2F7C83"
                style={{ marginRight: 4 }}
              />
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
                !row.isRegistered &&
                  row.isFull &&
                  !row.isWaitlisted &&
                  styles.joinWaitlistButton,
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
        </View>
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
  buttonContent: { height: 36, paddingHorizontal: 12, color: '#FFFFFF' },
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
