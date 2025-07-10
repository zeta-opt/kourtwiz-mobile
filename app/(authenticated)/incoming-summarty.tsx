import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, Divider, IconButton, Button } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetPlayerFinderRequest } from '@/hooks/apis/player-finder/useGetPlayerFinderRequest';
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
  const { data, loading, error } = useGetPlayerFinderRequest(requestId, userId);
  const [refetchComments, setRefetchComments] = useState<() => void>(() => () => {});

  const formatTimeArray = (arr: number[]) => {
    if (!arr || arr.length < 5) return 'Invalid Time';
    const [year, month, day, hour, minute] = arr;
    return `${day}/${month}/${year} ${hour.toString().padStart(2, '0')}:${minute
      .toString()
      .padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3F7CFF" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load invite details</Text>
      </View>
    );
  }

  const status = data.status?.toUpperCase() || 'PENDING';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>{data.placeToPlay}</Text>
      <Text>
        {formatTimeArray(data.playTime)} - {formatTimeArray(data.playEndTime)}
      </Text>
      <Text>Skill Rating: {data.skillRating}</Text>

      <Divider style={{ marginVertical: 10 }} />

      <Text style={styles.sectionLabel}>Player</Text>
      <View style={styles.playersContainer}>
        <View style={styles.row}>
          <Text style={[styles.nameText, { color: statusColorMap[status] }]}>{data.name}</Text>
          <View style={styles.roleInfo}>
            <IconButton
              icon={statusIconMap[status] || 'help-circle'}
              iconColor={statusColorMap[status] || 'gray'}
              size={18}
            />
            <Text style={{ color: statusColorMap[status] || 'gray' }}>{status}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Organizer</Text>
      <View style={[styles.row, { marginTop: 4 }]}>
        <Text style={[styles.nameText, styles.organizerName]}>{data.inviteeName}</Text>
        <Text style={styles.organizerName}>Organizer</Text>
      </View>

      <Divider style={{ marginVertical: 10 }} />
      <Text style={styles.subHeading}>Comments</Text>
      <ScrollView style={styles.commentsContainer} nestedScrollEnabled>
        <GetCommentPlayerFinder
          requestId={data.requestId}
          onRefetchAvailable={(ref) => setRefetchComments(() => ref)}
        />
      </ScrollView>

      {userId && data.requestId && (
        <>
          <Divider style={{ marginVertical: 10 }} />
          <PostCommentPlayerFinder
            requestId={data.requestId}
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
  organizerName: {
    color: '#6a1b9a',
    fontWeight: '600',
    fontSize: 14,
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
