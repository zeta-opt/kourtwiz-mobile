import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Invite {
  id: number;
  requestId: string;
  inviteeName: string;
  playTime: [number, number, number, number, number];
  placeToPlay: string;
  acceptUrl: string;
  declineUrl: string;
  status: string;
}

interface InvitationCardProps {
  invite: Invite;
  onAccept: (invite: Invite) => Promise<void> | void;
  onReject: (invite: Invite) => Promise<void> | void;
  loading: boolean;
  totalPlayers: number;
  acceptedPlayers: number;
  onViewPlayers: (requestId: string) => void;
}

const InvitationCard: React.FC<InvitationCardProps> = ({
  invite,
  onAccept,
  onReject,
  loading,
  totalPlayers,
  acceptedPlayers,
  onViewPlayers,
}) => {
  const router = useRouter();

  // Construct date and time
  const date = new Date(
    invite.playTime[0],
    invite.playTime[1] - 1,
    invite.playTime[2],
    invite.playTime[3],
    invite.playTime[4]
  );

  const timeString = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateString = date.toLocaleDateString('en-US', {
  month: '2-digit',
  day: '2-digit',
  year: 'numeric',
});


  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.9}
      onPress={() => {
        try {
          console.log('Navigating to request details:', invite.requestId);
          router.push({
            pathname: '/(authenticated)/myRequestsDetailedView',
            params: { requestId: invite.requestId },
          });
        } catch (err) {
          console.error('Navigation error:', err);
        }
      }}
    >
      <View style={styles.textBlock}>
        <Text style={styles.nameText}>{invite.inviteeName}</Text>
        <Text style={styles.detailsText}>
          {dateString} | {timeString} | {invite.placeToPlay}
        </Text>

        <View style={styles.acceptedRow}>
          <View style={styles.acceptedBox}>
            <MaterialCommunityIcons
              name='account-group'
              size={14}
              color='#007BFF'
            />
            <TouchableOpacity
              style={styles.acceptedBox}
              onPress={() => {
                console.log('Viewing players for requestId:', invite.requestId);
                onViewPlayers(invite.requestId);
              }}
            >
              <Text style={styles.acceptedTextSmall}>
                {acceptedPlayers} / {totalPlayers} Accepted
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => {
              try {
                console.log(
                  'Navigating to incoming summary for:',
                  invite.requestId
                );
                router.push({
                  pathname: '/(authenticated)/chat-summary',
                  params: { requestId: invite.requestId },
                });
              } catch (err) {
                console.error('Chat navigation error:', err);
              }
            }}
          >
            <MaterialCommunityIcons
              name='message-text-outline'
              size={14}
              color='#007BFF'
            />
            <Text style={styles.chatText}>Join Chat</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actions}>
        {invite.status === 'PENDING' ? (
          <>
            <TouchableOpacity
              onPress={async () => {
                try {
                  console.log('Attempting to accept invite:', invite);
                  await onAccept(invite);
                  console.log('Invite accepted successfully:', invite.id);
                } catch (err) {
                  console.error('Error while accepting invite:', err);
                }
              }}
              disabled={loading}
            >
              <MaterialCommunityIcons
                name='check-circle'
                size={26}
                color='green'
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={async () => {
                try {
                  console.log('Attempting to reject invite:', invite);
                  await onReject(invite);
                  console.log('Invite rejected successfully:', invite.id);
                } catch (err) {
                  console.error('Error while rejecting invite:', err);
                }
              }}
              disabled={loading}
            >
              <MaterialCommunityIcons
                name='close-circle'
                size={26}
                color='red'
              />
            </TouchableOpacity>
          </>
        ) : invite.status === 'ACCEPTED' ? (
          <Text style={styles.acceptedText}>✅ Accepted</Text>
        ) : invite.status === 'DECLINED' ? (
          <Text style={styles.rejectedText}>❌ Declined</Text>
        ) : invite.status === 'WITHDRAWN' ? (
          <Text style={styles.cancelledText}>🚫 Cancelled</Text>
        ) : null}
      </View>

      {loading && <ActivityIndicator style={styles.loading} size='small' />}
    </TouchableOpacity>
  );
};

export default InvitationCard;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  textBlock: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 12,
  },
  loading: {
    marginLeft: 8,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailsText: {
    color: '#666',
    fontSize: 13,
    marginBottom: 4,
  },
  acceptedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  acceptedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7FF',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  acceptedTextSmall: {
    marginLeft: 4,
    fontSize: 14,
    color: '#333',
    fontWeight: '700',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  chatText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#333',
    fontWeight: '700',
  },
  acceptedText: {
    color: 'green',
    fontWeight: 'bold',
  },
  rejectedText: {
    color: 'red',
    fontWeight: 'bold',
  },
  cancelledText: {
    color: '#FF8C00',
    fontWeight: 'bold',
  },
});
