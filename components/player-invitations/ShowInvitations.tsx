import { useGetInvitations } from '@/hooks/apis/invitations/useGetInvitations';
import { useCancelInvitation } from '@/hooks/apis/player-finder/useCancelInvite';
import { RootState } from '@/store';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { Card, Text, Modal, TextInput, Portal } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';

const formatDateTime = (dateArray: number[]) => {
  const date = new Date(
    ...(dateArray as [number, number, number, number, number])
  );
  return `${date.toDateString()} at ${date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const getStatusIcon = (
  status: string
): {
  name: React.ComponentProps<typeof MaterialIcons>['name'];
  color: string;
} => {
  switch (status) {
    case 'ACCEPTED':
      return { name: 'check-circle', color: 'green' };
    case 'DECLINED':
      return { name: 'cancel', color: 'red' };
    case 'PENDING':
      return { name: 'hourglass-empty', color: 'orange' };
    default:
      return { name: 'help', color: 'gray' };
  }
};

const ShowInvitations = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const {
    data: 
    invites,
    status,
    refetch,
  } = useGetInvitations({ userId: user?.userId });

  const { cancelInvitation } = useCancelInvitation();

  const [loadingId, setLoadingId] = useState<null | string>(null);
  const [loadingAction, setLoadingAction] = useState<'accept' | 'reject' | 'cancel' | null>(null);

  const [visibleModal, setVisibleModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [currentInviteId, setCurrentInviteId] = useState<string | null>(null);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  const openCommentModal = (inviteId: string, requestId: string) => {
    setCurrentInviteId(inviteId);
    setCurrentRequestId(requestId);
    setCommentText('');
    setVisibleModal(true);
  };

  const handleCancelWithComment = async () => {
    if (!currentRequestId || !user?.userId) return;
    try {
      setLoadingId(currentInviteId);
      setLoadingAction('cancel');
      setVisibleModal(false);

      await cancelInvitation(currentRequestId, user.userId, commentText);

      Toast.show({ type: 'success', text1: 'Invitation Withdrawn' });
      refetch();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to Withdraw' });
    } finally {
      setLoadingId(null);
      setLoadingAction(null);
    }
  };

  if (status === 'loading') return <Text>Loading...</Text>;
  if (!invites || invites.length === 0) {
    return <Text style={styles.noData}>No invitations to show.</Text>;
  }

  return (
    <View style={styles.container}>
      {invites.map((invite) => {
        const {
          id,
          placeToPlay,
          playTime,
          inviteeName,
          status,
          acceptUrl,
          declineUrl,
          requestId,
        } = invite;


        const icon = getStatusIcon(status);

        return (
          <Card
            key={id}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/incoming-summarty',
                params: { requestId },
              })
            }
          >
            <Card.Title title={placeToPlay} />
            <Card.Content>
              <Text>Date & Time: {formatDateTime(playTime)}</Text>
              <Text>Invitee: {inviteeName}</Text>
              <View style={styles.statusRow}>
                <MaterialIcons name={icon.name} size={20} color={icon.color} />
                <Text style={[styles.statusText, { color: icon.color }]}> {status}</Text>
                  {status === 'ACCEPTED' && (
                    <View style={styles.withdrawButtonWrapper}>
                      <Button
                        color="gray"
                        title={
                          loadingId === id && loadingAction === 'cancel'
                            ? 'Cancelling...'
                            : 'Withdraw'
                        }
                        disabled={loadingId === id}
                        onPress={() => openCommentModal(id, requestId)}
                      />
                    </View>
                  )}
                </View>

              <View style={styles.buttonRow}>
                {status === 'PENDING' && (
                  <>
                    <Button
                      color='green'
                      title={loadingId === id && loadingAction === 'accept' ? 'Accepting...' : 'Accept'}
                      disabled={loadingId === id}
                      onPress={async () => {
                        try {
                          setLoadingId(id);
                          setLoadingAction('accept');
                          const response = await fetch(acceptUrl);
                          if (response.status === 200) {
                            Toast.show({ type: 'success', text1: 'Invitation Accepted' });
                            refetch();
                          } else {
                            Toast.show({ type: 'error', text1: 'Unable to Accept!' });
                          }
                        } catch {
                          Toast.show({ type: 'error', text1: 'Unable to Accept!' });
                        } finally {
                          setLoadingId(null);
                          setLoadingAction(null);
                        }
                      }}
                    />
                    <Button
                      color='red'
                      title={loadingId === id && loadingAction === 'reject' ? 'Declining...' : 'Decline'}
                      disabled={loadingId === id}
                      onPress={async () => {
                        try {
                          setLoadingId(id);
                          setLoadingAction('reject');
                          const response = await fetch(declineUrl);
                          if (response.status === 200) {
                            Toast.show({ type: 'success', text1: 'Invitation Rejected' });
                            refetch();
                          } else {
                            Toast.show({ type: 'error', text1: 'Unable to Reject!' });
                          }
                        } catch {
                          Toast.show({ type: 'error', text1: 'Unable to Reject!' });
                        } finally {
                          setLoadingId(null);
                          setLoadingAction(null);
                        }
                      }}
                    />
                  </>
                )}
              </View>

              {/* Tap to view summary message */}
              <Text style={styles.tapHint}>Tap to view full summary</Text>
            </Card.Content>
          </Card>
        );
      })}

      {/* Modal for comment input */}
      <Portal>
        <Modal
          visible={visibleModal}
          onDismiss={() => setVisibleModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text>Optional Comment:</Text>
          <TextInput
            label="Comment"
            value={commentText}
            onChangeText={setCommentText}
            multiline
            style={styles.commentInput}
          />
          <Button title="Submit" onPress={handleCancelWithComment} />
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 12,
  },
  card: {
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statusText: {
    marginLeft: 4,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 10,
  },
  withdrawButtonWrapper: {
    marginLeft: 'auto',
  },  
  tapHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
  },
  noData: {
    marginTop: 20,
    textAlign: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  commentInput: {
    marginTop: 10,
    marginBottom: 20,
  },
});

export default ShowInvitations;
