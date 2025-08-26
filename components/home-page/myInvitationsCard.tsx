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
  onCancel: (invite: Invite) => Promise<void> | void; // NEW
  loading: boolean;
  totalPlayers: number;
  acceptedPlayers: number;
  onViewPlayers: (requestId: string) => void;
}

const InvitationCard: React.FC<InvitationCardProps> = ({
  invite,
  onAccept,
  onReject,
  onCancel,
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
              onPress={() => onViewPlayers(invite.requestId)}
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
              onPress={async () => { await onAccept(invite); }}
              disabled={loading}
            >
              <MaterialCommunityIcons
                name='check-circle'
                size={26}
                color='green'
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={async () => { await onReject(invite); }}
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
          <TouchableOpacity
            onPress={async () => { await onCancel(invite); }}
            disabled={loading}
            style={styles.cancelButton}
          >
            {/* <MaterialCommunityIcons
              name="cancel"
              size={26}
              color="#FF8C00"
            /> */}
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        ) : invite.status === 'WITHDRAWN' ? (
          <Text style={styles.cancelledText}>🚫 Withdrawn</Text>
        ) : invite.status === 'DECLINED'|| invite.status === 'CANCELLED' ? (
          <TouchableOpacity
            onPress={async () => { await onAccept(invite); }}
            disabled={loading}
            style={styles.acceptButton}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        ) : null}

      </View>

      {loading && <ActivityIndicator style={styles.loading} size='small' />}
    </TouchableOpacity>
  );
};

export default InvitationCard;

const styles = StyleSheet.create({
  cancelButton: {
  backgroundColor: 'red',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 6,
  alignItems: 'center',
  justifyContent: 'center',
},
cancelButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 14,
},
acceptButton: {
  backgroundColor: 'green',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 6,
  alignItems: 'center',
  justifyContent: 'center',
},
acceptButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 14,
},


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
