import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';


interface Invite {
  id: number;
  inviteeName: string;
  playTime: [number, number, number, number, number]; 
  acceptUrl: string;
  declineUrl: string;
  status: string;
}


interface InvitationCardProps {
  invite: Invite;
  onAccept: (invite: Invite) => void;
  onReject: (invite: Invite) => void;
  loading: boolean;
}

const InvitationCard: React.FC<InvitationCardProps> = ({ invite, onAccept, onReject, loading }) => {
  const date = new Date(...invite.playTime);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <View style={styles.nameAndTime}>
          <Text style={styles.name}>
            <Text style={{ fontWeight: 'bold' }}>{invite.inviteeName}</Text> has requested
          </Text>
          <View style={styles.timeRow}>
            <MaterialCommunityIcons
              name="clock-time-four-outline"
              size={14}
              color="#555"
            />
            <Text style={styles.time}>{timeString}</Text>
          </View>
        </View>
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
  nameAndTime: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  name: {
    fontSize: 14,
    color: '#333',
    flexShrink: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 12,
  },
  loading: {
    marginLeft: 8,
  },
});
