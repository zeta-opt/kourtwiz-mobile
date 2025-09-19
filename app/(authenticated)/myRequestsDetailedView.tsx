import UserAvatar from '@/assets/UserAvatar';
import { useCancelInvitation } from '@/hooks/apis/player-finder/useCancelInvite';
import { useGetPlayerFinderRequest } from '@/hooks/apis/player-finder/useGetPlayerFinderRequest';
import { RootState } from '@/store';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';
import { useSelector } from 'react-redux';

function arrayToDate(arr: number[]): Date {
  if (!arr || arr.length < 5) return new Date();
  return new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5] || 0);
}

export default function MyRequestsDetailedView() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const { data, loading, error, refetch } =
    useGetPlayerFinderRequest(requestId);
  console.log('Request Data:', data);
  const {
    cancelInvitation,
    status: cancelStatus,
    error: cancelerror,
  } = useCancelInvitation(refetch);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedAction, setSelectedAction] = useState<
    'accept' | 'reject' | 'cancel' | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loggedInUserId = useSelector(
    (state: RootState) => state.auth.user.userId
  );

  if (loading) return <ActivityIndicator size='large' style={styles.loader} />;
  if (error || !data)
    return <Text style={styles.error}>Error loading data</Text>;

  const myInvite = data?.find(
    (invite: any) => invite.userId === loggedInUserId
  );

  const invite = data[0];
  console.log('Invite Details:', invite);
  console.log('My Invite:', myInvite);
  const playTime = arrayToDate(invite?.playTime);
  const playEndTime = arrayToDate(invite?.playEndTime);
  const dateString = playTime.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
  console.log('Play Time:', playTime);
  const timeString = playTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTimeString = playEndTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const accepted = data.filter((p: any) => p.status === 'ACCEPTED').length + 1;
  const total = invite?.playersNeeded + 1 || 0;
  const location = invite?.placeToPlay || 'Not specified';
  const requesterName = invite?.inviteeName || 'Someone';

  const handleAction = (action: 'accept' | 'reject' | 'cancel') => {
    setSelectedAction(action);
    setComment('');
    setDialogVisible(true);
  };

  const handleDialogSubmit = async () => {
    if (!selectedAction || !invite) return;
    setDialogVisible(false);

    try {
      setIsSubmitting(true);

      if (selectedAction === 'accept' || selectedAction === 'reject') {
        const oldUrl =
          selectedAction === 'accept'
            ? myInvite.acceptUrl
            : myInvite.declineUrl;

        const newBase = 'https://api.vddette.com';
        const urlObj = new URL(oldUrl);
        const newUrl = `${newBase}${urlObj.pathname}${
          urlObj.search
        }&comments=${encodeURIComponent(comment)}`;

        console.log('Submitting to URL:', newUrl);

        const response = await fetch(newUrl);
        if (response.status === 200) {
          Alert.alert('Success', `Invitation ${selectedAction}ed`);
          refetch();
        } else {
          const errorText = await response.text();
          console.log('Error response:', errorText);
          Alert.alert('Error', errorText || 'Failed to process the invitation');
        }
      } else if (selectedAction === 'cancel') {
        const ok = await cancelInvitation(
          invite.requestId,
          loggedInUserId,
          comment || ''
        );

        if (ok) {
          Alert.alert('Success', 'Invitation cancelled');
          refetch();
        } else {
          Alert.alert('Error', cancelerror || 'Failed to cancel invitation');
        }
      }
    } catch (err) {
      Alert.alert(
        'Error',
        `Something went wrong while trying to ${selectedAction}`
      );
    } finally {
      setIsSubmitting(false);
      setDialogVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='chevron-back' size={24} color='#000' />
        </TouchableOpacity>
        <Text style={styles.title}>Incoming Request</Text>
        <TouchableOpacity
          onPress={() => router.push('/(authenticated)/profile')}
        >
          <UserAvatar size={36} />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.subheading}>{requesterName} Invited To Play</Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.column}>
                <View style={styles.infoCard}>
                  <FontAwesome5
                    name='calendar-alt'
                    size={20}
                    color='#2CA6A4'
                    solid
                  />
                </View>
                <Text style={styles.infoText}>{dateString}</Text>
              </View>
              <View style={styles.column}>
                <View style={styles.infoCard}>
                  <FontAwesome5 name='clock' size={20} color='#2CA6A4' solid />
                </View>
                <Text style={styles.infoText}>{timeString} - {endTimeString}</Text>
              </View>
              <View style={styles.column}>
                <View style={styles.infoCard}>
                  <FontAwesome5 name='users' size={20} color='#2CA6A4' />
                </View>
                <Text style={styles.infoText}>
                  {accepted}/{total} Accepted
                </Text>
              </View>
            </View>

            <View style={styles.locationRow}>
              <View style={styles.locationIconWrapper}>
                <FontAwesome5 name='map-marker-alt' size={16} color='#2CA6A4' />
              </View>
              <Text style={styles.locationText}>Event Place: {location}</Text>
            </View>
          </View>

          <View style={styles.chatPreviewContainer}>
            
            <TouchableOpacity
              style={styles.chatRow}
              onPress={() =>
                router.push({
                  pathname: '/(authenticated)/chat-summary',
                  params: { requestId },
                })
              }
            >
              <Text style={styles.chatPreviewText}>Chat with players here...</Text>
              {/* <Text style={styles.joinButtonText}>Chat</Text> */}
              <MaterialCommunityIcons
              name='message-text-outline'
              size={16}
              color='#007BFF'
            />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Bottom Actions */}
      {myInvite?.status === 'PENDING' && (
        <View style={styles.bottomButtonContainer}>
          <Button
            icon='check'
            mode='contained'
            onPress={() => handleAction('accept')}
            loading={isSubmitting && selectedAction === 'accept'}
            style={styles.acceptBtn}
          >
            Accept
          </Button>
          <Button
            icon='close'
            mode='outlined'
            onPress={() => handleAction('reject')}
            loading={isSubmitting && selectedAction === 'reject'}
            style={styles.rejectBtn}
          >
            Decline
          </Button>
        </View>
      )}

      {myInvite?.status === 'ACCEPTED' && (
        <View style={styles.bottomButtonContainer}>
          <Button
            icon='cancel'
            mode='outlined'
            onPress={() => handleAction('cancel')}
            loading={isSubmitting && selectedAction === 'cancel'}
            style={styles.rejectBtn}
          >
            Cancel
          </Button>
        </View>
      )}

      {(myInvite?.status === 'CANCELLED' ||
        myInvite?.status === 'DECLINED') && (
        <View style={styles.bottomButtonContainer}>
          <Button
            icon='check'
            mode='contained'
            onPress={() => handleAction('accept')}
            loading={isSubmitting && selectedAction === 'accept'}
            style={styles.acceptBtn}
          >
            Accept Again
          </Button>
        </View>
      )}

      {myInvite?.status === 'WITHDRAWN' && (
        <View>
          <Text style={styles.withdrawBtn}>🚫 Withdrawn</Text>
        </View>
      )}

      {/* Dialog */}
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Title>Add a message</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label='Comment (optional)'
              value={comment}
              onChangeText={setComment}
              mode='outlined'
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDialogSubmit}>Submit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: '#F9F9F9',
  },
  withdrawBtn: {
    textAlign: 'center',
    fontSize: 16,
    color: 'red',
    fontWeight: '600',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
  },
  subheading: {
    textAlign: 'left',
    fontSize: 16,
    color: '#000000',
    marginBottom: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  column: {
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    marginTop: 4,
    fontSize: 13,
    color: '#333',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 28,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#444',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  infoCard: {
    backgroundColor: '#E6F7F7',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 30,
    alignItems: 'center',
    width: '40%',
    alignSelf: 'center',
  },
  locationIconWrapper: {
    backgroundColor: '#E6F7F7',
    padding: 8,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatPreviewContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  chatPreviewText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  joinButton: {
    backgroundColor: '#007A7A',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  acceptBtn: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#007A7A',
  },
  rejectBtn: {
    flex: 1,
    borderColor: '#007A7A',
    borderWidth: 1,
    color: '#007A7A',
  },
  chatRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

});
