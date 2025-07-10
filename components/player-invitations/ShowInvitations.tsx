import { useGetInvitations } from '@/hooks/apis/invitations/useGetInvitations';
import { RootState } from '@/store';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
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
    data: invites,
    status,
    refetch,
  } = useGetInvitations({ userId: user?.userId });

  const [loadingId, setLoadingId] = React.useState<null | number>(null);
  const [loadingAction, setLoadingAction] = React.useState<'accept' | 'reject' | null>(null);

  if (status === 'loading') return <Text>Loading...</Text>;
  if (!invites || invites.length === 0) {
    return <Text style={styles.noData}>No invitations to show.</Text>;
  }

  return (
    <View style={styles.container}>
      {invites.map((invite) => {
        const {
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
            key={invite.id}
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
                <Text style={[styles.statusText, { color: icon.color }]}>
                  {' '}
                  {status}
                </Text>
              </View>

              {status === 'PENDING' && (
                <View style={styles.buttonRow}>
                  <Button
                    color='green'
                    title={
                      loadingId === invite.id && loadingAction === 'accept'
                        ? 'Accepting...'
                        : 'Accept'
                    }
                    disabled={loadingId === invite.id}
                    onPress={async () => {
                      try {
                        setLoadingId(invite.id);
                        setLoadingAction('accept');
                        console.log('accepting: ', acceptUrl);
                        const response = await fetch(acceptUrl);
                        const statusCode = response.status;
                        const text = await response.text();
                        console.log(
                          `Accepted! Status: ${statusCode}, Response: ${text}`
                        );
                        if (statusCode === 200) {
                          Toast.show({
                            type: 'success',
                            text1: 'Invitation Accepted',
                          });
                          refetch();
                        } else {
                          Toast.show({
                            type: 'error',
                            text1: 'Unable to Accept!',
                          });
                        }
                      } catch (error) {
                        Toast.show({
                          type: 'error',
                          text1: 'Unable to Accept!',
                        });
                        console.error('Error accepting invitation:', error);
                      } finally {
                        setLoadingId(null);
                        setLoadingAction(null);
                      }
                    }}
                  />

                  <Button
                    color='red'
                    title={
                      loadingId === invite.id && loadingAction === 'reject'
                        ? 'Declining...'
                        : 'Decline'
                    }
                    disabled={loadingId === invite.id}
                    onPress={async () => {
                      try {
                        setLoadingId(invite.id);
                        setLoadingAction('reject');
                        console.log('rejecting: ', declineUrl);
                        const response = await fetch(declineUrl);
                        const statusCode = response.status;
                        const text = await response.text();
                        console.log(
                          `Rejected! Status: ${statusCode}, Response: ${text}`
                        );
                        if (statusCode === 200) {
                          Toast.show({
                            type: 'success',
                            text1: 'Invitation Rejected',
                          });
                          refetch();
                        } else {
                          Toast.show({
                            type: 'error',
                            text1: 'Unable to Reject!',
                          });
                        }
                      } catch (error) {
                        Toast.show({
                          type: 'error',
                          text1: 'Unable to Reject!',
                        });
                        console.error('Error rejecting invitation:', error);
                      } finally {
                        setLoadingId(null);
                        setLoadingAction(null);
                      }
                    }}
                  />
                </View>
              )}

              {/* Tap to view summary message */}
              <Text style={styles.tapHint}>Tap to view full summary</Text>
            </Card.Content>
          </Card>
        );
      })}
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
  tapHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
  },
  noData: {
    marginTop: 20,
    textAlign: 'center',
  },
});

export default ShowInvitations;
