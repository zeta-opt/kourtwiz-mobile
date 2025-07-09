import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Divider, IconButton, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
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
  const { data } = useLocalSearchParams<{ data: string }>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId;

  const [invite, setInvite] = useState<any | null>(null);
  const [refetchComments, setRefetchComments] = useState<() => void>(() => () => {});

  useEffect(() => {
    if (data) {
      try {
        const decoded = JSON.parse(decodeURIComponent(data));
        setInvite(decoded);
      } catch (err) {
        console.error('Failed to decode invite data:', err);
      }
    }
  }, [data]);

  const formatTimeArray = (timeArr: number[]) => {
    if (!Array.isArray(timeArr) || timeArr.length < 5) return 'Invalid Time';
    const [year, month, day, hour, minute] = timeArr;
    const date = new Date(year, month - 1, day, hour, minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!invite) return <Text style={styles.emptyText}>Loading...</Text>;

  const requestId = invite?.requestId || invite?.Requests?.[0]?.requestId;
  const organizerName = invite?.Requests?.[0]?.inviteeName ?? 'Unknown';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>{invite.placeToPlay}</Text>
      <Text>{invite.date} - {formatTimeArray(invite.Requests?.[0]?.playEndTime)}</Text>
      <Text>Skill Rating: {invite.skillRating}</Text>

      <Divider style={{ marginVertical: 10 }} />

      <Text style={styles.sectionLabel}>Players</Text>
      <View style={styles.playersContainer}>
        {invite.Requests?.map((player: any) => {
          const status = player.status?.toUpperCase() || 'PENDING';
          return (
            <View key={player.id} style={styles.row}>
              <Text style={[styles.nameText, { color: statusColorMap[status] || 'gray' }]}>
                {player.name}
              </Text>
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

      <Text style={styles.sectionLabel}>Organizer</Text>
      <View style={[styles.row, { marginTop: 4 }]}>
        <Text style={[styles.nameText, styles.organizerName]}>{organizerName}</Text>
        <Text style={styles.organizerName}>Organizer</Text>
      </View>

      <Divider style={{ marginVertical: 10 }} />
      <Text style={styles.subHeading}>Comments</Text>
      <View style={styles.commentsContainer}>
        <GetCommentPlayerFinder
          requestId={requestId}
          onRefetchAvailable={(ref) => setRefetchComments(() => ref)}
        />
      </View>

      {userId && requestId && (
        <>
          <Divider style={{ marginVertical: 10 }} />
          <PostCommentPlayerFinder
            requestId={requestId}
            userId={userId}
            onSuccess={() => {
              refetchComments();
            }}
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
  emptyText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#888',
  },
});
