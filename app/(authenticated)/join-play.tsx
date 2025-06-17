import JoinPlayCards from '@/components/join-play/JoinPlayCards';
import { useGetClubCourt } from '@/hooks/apis/courts/useGetClubCourts';
import { useGetPlays } from '@/hooks/apis/join-play/useGetPlays';
import { useMutateJoinPlay } from '@/hooks/apis/join-play/useMutateJoinPlay';
import LoaderScreen from '@/shared/components/Loader/LoaderScreen';
import { RootState } from '@/store';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';

export default function JoinPlay() {
  const { user } = useSelector((state: RootState) => state.auth);
  const clubId = user?.currentActiveClubId;
  const userId = user?.userId;
  const { data: playsData, status, refetch } = useGetPlays(clubId);
  const { data: courtsData, status: courtsStatus } = useGetClubCourt({
    clubId,
  });
  const { joinPlaySession } = useMutateJoinPlay();
  const [rows, setRows] = useState<Record<string, string>[]>([]);
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
  // console.log('play data : ', playsData);
  // console.log('courts data : ', courtsData);
  const handleJoinPlay = async (id: string) => {
    setLoadingId(id);
    await joinPlaySession({
      userId,
      sessionId: id,
      callbacks: {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: 'joined!',
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
  useEffect(() => {
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
        buttonDisable:
          play.registeredPlayers?.some((id: string) => id === userId) ?? false,
      };
    });

    setRows(dataRows);
  }, [clubId, playsData, courtsData, userId]);

  if (status === 'loading' || courtsStatus === 'loading')
    return <LoaderScreen />;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Play Sessions</Text>
      <JoinPlayCards
        columns={columns}
        rows={rows}
        onJoinPlay={handleJoinPlay}
        loadingId={loadingId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 5 },
  text: { fontSize: 24 },
});
