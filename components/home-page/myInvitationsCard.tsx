import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
  onAccept: (invite: Invite) => void;
  onReject: (invite: Invite) => void;
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
  //const now = new Date();
  const date = new Date(
    invite.playTime[0],
    invite.playTime[1] - 1,
    invite.playTime[2],
    invite.playTime[3],
    invite.playTime[4]
  );

  //const diffInMs = date.getTime() - now.getTime();
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = date.toLocaleDateString('en-GB');

  // let timeLeftText = '';
  // let badgeColor = '#ffffff';

  // if (diffInMs > 0) {
  //   const totalSeconds = Math.floor(diffInMs / 1000);
  //   const totalMinutes = Math.floor(totalSeconds / 60);
  //   const totalHours = Math.floor(totalMinutes / 60);
  //   const totalDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  //   if (totalDays >= 1) {
  //     timeLeftText = `${totalDays} Day${totalDays > 1 ? 's' : ''} Left`;
  //     badgeColor = '#3CB371';
  //   } else if (totalHours >= 1) {
  //     const hours = totalHours.toString().padStart(2, '0');
  //     const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  //     timeLeftText = `${hours}:${minutes} Hrs Left`;
  //     badgeColor = '#3CB371';
  //   } else {
  //     const minutes = totalMinutes.toString().padStart(2, '0');
  //     const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  //     timeLeftText = `${minutes}:${seconds} Mins Left`;
  //     badgeColor = '#d00';
  //   }
  // }

  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        {/* <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{timeLeftText}</Text>
        </View> */}
        <Text style={styles.nameText}>{invite.inviteeName}</Text>
        <Text style={styles.detailsText}>
          {dateString}  |  {timeString}  |  {invite.placeToPlay}
        </Text>

        <View style={styles.acceptedRow}>
          <View style={styles.acceptedBox}>
            <MaterialCommunityIcons name="account-group" size={14} color="#007BFF" />
            <TouchableOpacity
              style={styles.acceptedBox}
              onPress={() => onViewPlayers(invite.requestId)} 
            >
              {/* <MaterialCommunityIcons name="account-group" size={14} color="#007BFF" /> */}
              <Text style={styles.acceptedTextSmall}>{acceptedPlayers} / {totalPlayers} Accepted</Text>
            </TouchableOpacity>

          </View>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() =>
              router.push({ pathname: '/(authenticated)/incoming-summarty', params: { requestId: invite.requestId } })
            }
          >
            <MaterialCommunityIcons name="message-text-outline" size={14} color="#007BFF" />
            <Text style={styles.chatText}>Join Chat</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actions}>
        {invite.status === 'PENDING' ? (
          <>
            <TouchableOpacity onPress={() => onAccept(invite)} disabled={loading}>
              <MaterialCommunityIcons name="check-circle" size={26} color="green" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onReject(invite)} disabled={loading}>
              <MaterialCommunityIcons name="close-circle" size={26} color="red" />
            </TouchableOpacity>
          </>
        ) : invite.status === 'ACCEPTED' ? (
          <Text style={styles.acceptedText}>✅ Accepted</Text>
        ) : invite.status === 'DECLINED' ? (
          <Text style={styles.rejectedText}>❌ Declined</Text>
        ) : invite.status === 'CANCELLED' ? (
          <Text style={styles.cancelledText}>🚫 Cancelled</Text>
        ) : null}
      </View>

      {loading && <ActivityIndicator style={styles.loading} size="small" />}
    </View>
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
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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
