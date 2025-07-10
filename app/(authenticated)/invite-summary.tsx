import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Divider, IconButton, Modal, Portal, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { GetCommentPlayerFinder } from '@/components/find-players/comment-layout/GetCommentPlayerFinder';
import { PostCommentPlayerFinder } from '@/components/find-players/comment-layout/PostCommentPlayerFinder';
import { useWithdrawRequest } from '@/hooks/apis/player-finder/useWithdrawRequest';
import Toast from 'react-native-toast-message';

const statusColorMap: Record<string, string> = {
  ACCEPTED: 'green',
  PENDING: 'orange',
  DECLINED: 'red',
  WITHDRAWN: 'gray',
};

const statusIconMap: Record<string, string> = {
  ACCEPTED: 'check-circle',
  PENDING: 'clock',
  DECLINED: 'close-circle',
  WITHDRAWN: 'minus-circle',
};

export default function InviteSummaryPage() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId;

  const { withdrawRequest, status } = useWithdrawRequest();
  const [invite, setInvite] = useState<any | null>(null);
  const [refetchComments, setRefetchComments] = useState<() => void>(() => () => {});

  // Comment Modal State
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [withdrawComment, setWithdrawComment] = useState('');

  useEffect(() => {
    if (data) {
      try {
        const decoded = JSON.parse(decodeURIComponent(data));
        console.log('Decoded invite object:', decoded);
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
  const requestorId = invite?.Requests?.[0]?.userId;
  const isOrganizer = userId === requestorId;


  const handleWithdraw = async () => {
    try {
      await withdrawRequest(requestId, userId, withdrawComment);
      Toast.show({ type: 'success', text1: 'Game Invite Withdrawn' });
      setCommentModalVisible(false);
      router.replace('/(authenticated)/find-players');
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to Withdraw Game Invite' });
      console.error(err);
    }
  };

  return (
    <>
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
        <ScrollView style={styles.commentsContainer} nestedScrollEnabled>
          <GetCommentPlayerFinder
            requestId={requestId}
            onRefetchAvailable={(ref) => setRefetchComments(() => ref)}
          />
        </ScrollView>

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

        {userId && requestId && (
          <Button
            mode="contained"
            buttonColor="gray"
            textColor="white"
            style={{ borderRadius: 20 }}
            onPress={() => setCommentModalVisible(true)}
            loading={status === 'loading'}
            disabled={status === 'loading'}
          >
            Withdraw Game Invite
          </Button>
        )}

        <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
          Go Back
        </Button>
      </ScrollView>

      {/* Comment Modal */}
      <Portal>
        <Modal
          visible={commentModalVisible}
          onDismiss={() => setCommentModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View>
            <Text style={styles.modalTitle}>Withdraw Game Invite</Text>
            <TextInput
              placeholder="Optional comment"
              multiline
              numberOfLines={4}
              value={withdrawComment}
              onChangeText={setWithdrawComment}
              style={styles.input}
            />

            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={() => setCommentModalVisible(false)}
                style={[styles.actionButton, { borderColor: '#ccc' }]}
                textColor="#333"
              >
                Cancel
              </Button>

              <Button
                mode="contained"
                onPress={handleWithdraw}
                loading={status === 'loading'}
                disabled={status === 'loading'}
                style={[styles.actionButton, { marginLeft: 10 }]}
              >
                Confirm Withdraw
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </>
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
    marginTop: 12,
    marginBottom: 120,
    borderRadius: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#888',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },  
});
