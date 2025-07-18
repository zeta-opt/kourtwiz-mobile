import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetClubCourt } from '@/hooks/apis/courts/useGetClubCourts';
import { useGetPlays } from '@/hooks/apis/join-play/useGetPlays';
import { useMutateJoinPlay } from '@/hooks/apis/join-play/useMutateJoinPlay';
import LoaderScreen from '@/shared/components/Loader/LoaderScreen';
import { RootState } from '@/store';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text} from 'react-native-paper';
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
  isPlayerRegistered: boolean;
  [key: string]: any; // Add index signature
};

const columnIcons: Record<string, React.ReactNode> = {
  date: <MaterialCommunityIcons name='calendar' size={16} />,
  time: <MaterialCommunityIcons name='clock-outline' size={16} />,
  duration: <MaterialCommunityIcons name='timer-outline' size={16} />,
  'skill level': <MaterialCommunityIcons name='chart-line' size={16} />,
  court: <MaterialCommunityIcons name='tennis' size={16} />,
  'max slots': <MaterialCommunityIcons name='account-multiple' size={16} />,
  'filled slots': <MaterialCommunityIcons name='account-check' size={16} />,
  action: <MaterialCommunityIcons name='play-circle-outline' size={16} />,
};

const OpenPlayCard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const clubId = user?.currentActiveClubId;
  const userId = user?.userId;
  const { data: playsData, status, refetch } = useGetPlays(clubId);
  const { data: courtsData, status: courtsStatus } = useGetClubCourt({
    clubId,
  });
  const { joinPlaySession } = useMutateJoinPlay();
  const [rows, setRows] = useState<PlayRow[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const columns = [
    'date',
    'time',
    'duration',
    'skill level',
    'court',
    'max slots',
    'filled slots',
    'action',
  ];

  const handleJoinPlay = async (id: string, isFull: boolean) => {
    setLoadingId(id);
    await joinPlaySession({
      userId,
      sessionId: id,
      callbacks: {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: isFull ? 'Joined wait list' : 'joined play',
            topOffset: 100,
          });
          refetch();
          setLoadingId(null);
        },
        onError: () => {
          Toast.show({
            type: 'error',
            text1: 'unable to join',
            topOffset: 100,
          });
          setLoadingId(null);
        },
      },
    });
  };

  const getRowValue = (row: PlayRow, col: string): string | number => {
    switch (col) {
      case 'date':
        return row.date;
      case 'time':
        return row.time;
      case 'duration':
        return row.duration;
      case 'skill level':
        return row['skill level'];
      case 'court':
        return row.court;
      case 'max slots':
        return row['max slots'];
      case 'filled slots':
        return row['filled slots'];
      case 'action':
        return row.action;
      default:
        return '';
    }
  };

  const buttonMessage = (isRegistered: boolean, isFull: boolean): string => {
    if (!isRegistered && !isFull) {
      return 'Join Play';
    } else if (!isRegistered && isFull) {
      return 'Join Waitlist';
    } else {
      return 'Joined';
    }
  };

  useEffect(() => {
    console.log('OpenPlayCard - playsData:', playsData);
    console.log('OpenPlayCard - courtsData:', courtsData);
    console.log('OpenPlayCard - clubId:', clubId);
    console.log('OpenPlayCard - userId:', userId);
    console.log('OpenPlayCard - status:', status);
    console.log('OpenPlayCard - courtsStatus:', courtsStatus);
    
    if (
      !playsData ||
      playsData?.length === 0 ||
      !courtsData ||
      courtsData?.length === 0
    )
      return;

    const courtMap: Record<string, string> = {};
    courtsData.forEach((data: any) => {
      courtMap[data.id] = data.name;
    });

    const dataRows = playsData.map((play: any) => {
      const startDate = new Date(
        play.startTime[0],
        play.startTime[1] - 1,
        play.startTime[2],
        play.startTime[3],
        play.startTime[4]
      );

      return {
        id: play.id,
        date: startDate.toLocaleDateString(),
        time: startDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        duration: play.durationMinutes,
        'skill level': play.skillLevel,
        court: courtMap[play.courtId],
        'max slots': play.maxPlayers,
        'filled slots': play.registeredPlayers?.length,
        action: play.playTypeName.split('_').join(' ').toLowerCase(),
        isFull: play.registeredPlayers?.length >= play.maxPlayers,
        isPlayerRegistered:
          play.registeredPlayers?.some((id: string) => id === userId) ?? false,
      };
    });

    console.log('OpenPlayCard - processed rows:', dataRows);
    setRows(dataRows);
  }, [clubId, playsData, courtsData, userId, status, courtsStatus]);

  if (!clubId) {
    return <Text style={styles.noDataText}>You&apos;re not a member of a club yet.</Text>;
  }

  if (status === 'loading' || courtsStatus === 'loading') {
    console.log('OpenPlayCard - Loading state');
    return <LoaderScreen />;
  }

  console.log('OpenPlayCard - Final render, rows.length:', rows.length);

  if (rows.length === 0) {
    console.log('OpenPlayCard - No rows to display');
    return <Text style={styles.noDataText}>No open play sessions available</Text>;
  }

  return (
    <>
      {rows.map((row, idx) => (
        <Card key={idx} style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <View style={styles.column}>
                {columns.map((col, i) => (
                  <View key={i} style={styles.field}>
                    <Text style={styles.label}>
                      {columnIcons[col]} {col}: <Text style={styles.value}>{getRowValue(row, col)}</Text>
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.buttonWrapper}>
                <Button
                  mode='contained'
                  onPress={() => handleJoinPlay(row.id, row.isFull)}
                  style={styles.button}
                  disabled={row.isPlayerRegistered}
                  loading={row.id === loadingId}
                >
                  {buttonMessage(row.isPlayerRegistered, row.isFull)}
                </Button>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
  },
  field: {
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#374151',
  },
  value: {
    fontWeight: 'normal',
    color: '#6B7280',
  },
  buttonWrapper: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  button: {
    marginTop: 10,
  },
  noDataText: {
    textAlign: 'center',
    color: '#000000',
    fontSize: 14,
    paddingVertical: 20,
  },
});

export default OpenPlayCard;