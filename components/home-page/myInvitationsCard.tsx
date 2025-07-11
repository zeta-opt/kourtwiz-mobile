import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';


interface Invite {
  id: number;
  requestId: string;
  inviteeName: string;
  playTime: [number, number, number, number, number];
  placeToPlay:string;
  acceptUrl: string;
  declineUrl: string;
  status: string;
}


interface InvitationCardProps {
  invite: Invite;
  onAccept: (invite: Invite) => void;
  onReject: (invite: Invite) => void;
  loading: boolean;
  highlight?: boolean;
}

const InvitationCard: React.FC<InvitationCardProps> = ({ invite, onAccept, onReject, loading }) => {
  const router = useRouter();
  const now = new Date();
  const adjustedPlayTime = [...invite.playTime];
  adjustedPlayTime[1] -= 1;
  const date = new Date(
    invite.playTime[0],
    invite.playTime[1] - 1,
    invite.playTime[2],
    invite.playTime[3],
    invite.playTime[4]
  );  
  const diffInMs = date.getTime() - now.getTime();
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = date.toLocaleDateString('en-GB');

  let timeLeftText = '';
  let badgeColor = '#ffffff'; // default white

  if (diffInMs > 0) {
    const totalSeconds = Math.floor(diffInMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (totalDays >= 1) {
      timeLeftText = `${totalDays} Day${totalDays > 1 ? 's' : ''} Left`;
      badgeColor = '#3CB371'; // green
    } else if (totalHours >= 1) {
      const hours = totalHours.toString().padStart(2, '0');
      const minutes = (totalMinutes % 60).toString().padStart(2, '0');
      timeLeftText = `${hours}:${minutes} Hrs Left`;
      badgeColor = '#3CB371'; // green
    } else {
      const minutes = totalMinutes.toString().padStart(2, '0');
      const seconds = (totalSeconds % 60).toString().padStart(2, '0');
      timeLeftText = `${minutes}:${seconds} Mins Left`;
      badgeColor = '#d00'; // red
    }
  }

  return (
    <Pressable onPress={() => router.push({ pathname: '/(authenticated)/incoming-summarty', params: { requestId: invite.requestId } })}>


      <View style={[styles.row]}>
        <View style={styles.textBlock}>
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{timeLeftText}</Text>
          </View>
          <Text style={styles.nameText}>{invite.inviteeName}</Text>
          <Text style={styles.detailsText}>
            {dateString}  |  {timeString}  |  {invite.placeToPlay}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onAccept(invite)} disabled={loading}>
            <MaterialCommunityIcons name="check-circle" size={26} color="green" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onReject(invite)} disabled={loading}>
            <MaterialCommunityIcons name="close-circle" size={26} color="red" />
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator style={styles.loading} size="small" />}
      </View>
    </Pressable>
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
  highlightedRow: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },  
  textBlock: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
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
  },
});
