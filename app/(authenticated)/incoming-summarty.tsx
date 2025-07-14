import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, Divider, IconButton, Button } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetPlayerFinderRequest, PlayerFinderRequest } from '@/hooks/apis/player-finder/useGetPlayerFinderRequest';
import { GetCommentPlayerFinder } from '@/components/find-players/comment-layout/GetCommentPlayerFinder';
import { PostCommentPlayerFinder } from '@/components/find-players/comment-layout/PostCommentPlayerFinder';

const statusColorMap: Record<string, string> = {
  ACCEPTED: 'green',
  PENDING: 'orange',
  DECLINED: 'red',
};

const statusIconMap: Record<string, string> = {
  ACCEPTED: 'check-circle',
  PENDING: 'clock',
  DECLINED: 'close-circle',
};

export default function InviteSummaryPage() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId ?? '';
  const { data, loading, error } = useGetPlayerFinderRequest(requestId);
  const [refetchComments, setRefetchComments] = useState<() => void>(() => () => {});
  console.log('Invite Summary Data:', data);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3F7CFF" />
      </View>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load invite details</Text>
      </View>
    );
  }

  const mainRequest = data[0];
  const acceptedCount = data.filter((d) => d.status === 'ACCEPTED').length;
  const totalNeeded = mainRequest.playersNeeded || 0;

  const formatTimeArray = (timeArr: number[]) => {
    if (!Array.isArray(timeArr) || timeArr.length < 5) return 'Invalid Time';
    const [year, month, day, hour, minute] = timeArr;
    const date = new Date(year, month - 1, day, hour, minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateArray = (timeArr: number[]) => {
    if (!Array.isArray(timeArr) || timeArr.length < 5) return 'Invalid Date';
    const [year, month, day] = timeArr;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>{mainRequest.placeToPlay}</Text>
      <Text>
        {formatDateArray(mainRequest.playTime)}, {formatTimeArray(mainRequest.playTime)} - {formatTimeArray(mainRequest.playEndTime)}
      </Text>
      <Text>Skill Rating: {mainRequest.skillRating}</Text>
      <Text style={{ marginTop: 4 }}>Accepted: {acceptedCount}/{totalNeeded}</Text>

      <Divider style={{ marginVertical: 10 }} />

      <Text style={styles.sectionLabel}>Players</Text>
      <View style={styles.playersContainer}>
        {data.map((player: PlayerFinderRequest) => {
          const status = player.status?.toUpperCase() || 'PENDING';
          return (
            <View key={player.userId} style={styles.row}>
              <Text style={[styles.nameText, { color: statusColorMap[status] || 'gray' }]}>{player.name}</Text>
              <View style={styles.roleInfo}>
                <IconButton
                  icon={statusIconMap[status] || 'help-circle'}
                  iconColor={statusColorMap[status] || 'gray'}
                  size={18}
                />
                <Text style={{ color: statusColorMap[status] || 'gray' }}>{status}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <Divider style={{ marginVertical: 10 }} />
      <Text style={styles.subHeading}>Comments</Text>
      <ScrollView style={styles.commentsContainer} nestedScrollEnabled>
        <GetCommentPlayerFinder
          requestId={mainRequest.requestId}
          onRefetchAvailable={(ref) => setRefetchComments(() => ref)}
        />
      </ScrollView>

      {userId && mainRequest.requestId && (
        <>
          <Divider style={{ marginVertical: 10 }} />
          <PostCommentPlayerFinder
            requestId={mainRequest.requestId}
            userId={userId}
            onSuccess={() => refetchComments()}
          />
        </>
      )}

      <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
        Go Back
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'gray',
    marginBottom: 6,
    marginTop: 8,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '500',
    color: 'gray',
    marginBottom: 4,
  },
  playersContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 5,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  nameText: {
    fontSize: 14,
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentsContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 5,
    marginBottom: 10,
    maxHeight: 200,
  },
  backButton: {
    marginTop: 20,
    borderRadius: 20,
  },
  errorText: {
    color: '#D8000C',
    fontSize: 16,
  },
});
