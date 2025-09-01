import React from 'react';
import { StyleSheet, View, TouchableOpacity, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type Invite = {
  requestId: string;
  playTime: [number, number, number, number?, number?];
  placeToPlay: string;
  dateTimeMs: number;
  accepted: number;
  playersNeeded: number;
  status: string;
  Requests: any[];
  eventName: string;
};

type OutgoingInviteCardItemProps = {
  invite: Invite;
  disabled?: boolean;
  onViewPlayers: (requestId: string) => void;
};

const OutgoingInviteCardItem: React.FC<OutgoingInviteCardItemProps> = ({ invite, disabled = false, onViewPlayers }) => {
  const router = useRouter();

  const acceptedCount = invite.accepted + 1 || 0;
  const totalPlayers = invite.playersNeeded + 1 || 0;
  console.log('Invite:', invite);

  const isFullyAccepted = acceptedCount === totalPlayers;
  const statusText = isFullyAccepted ? 'Accepted' : 'Pending';
  const statusColor = isFullyAccepted ? '#429645' : '#c47602';
  const statusCount = isFullyAccepted
  ? `${acceptedCount}/${totalPlayers}`
  : `${totalPlayers - acceptedCount}/${totalPlayers}`;

  const formatDateParts = (timestamp: number) => {
    const dateObj = new Date(timestamp);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    const dateString = `${month}/${day}/${year}`;
    const timeString = dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return { dateString, timeString };
  };

  const { dateString, timeString } = formatDateParts(invite.dateTimeMs);

  const handlePress = () => {
    if (!invite) return;
  
    try {
      const encoded = encodeURIComponent(JSON.stringify(invite));
      console.log('Encoded invite for navigation:', encoded);
      router.push({
        pathname: '/(authenticated)/sentRequestsDetailedView',
        params: { data: encoded },
      });
    } catch (error) {
      console.error('Failed to encode invite:', error);
    }
  };
  

  return (
    <TouchableOpacity style={styles.card} disabled={disabled} onPress={handlePress}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
        <View style={{ flex: 1 }}>
          <View style={styles.statusBadgeContainer}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusBadgeText}>
              {statusCount} {statusText}
              </Text>
            </View>
          </View>

          <Text style={styles.placeText} numberOfLines={1}>
          {invite.eventName?.trim() || invite.Requests?.[0]?.eventName?.trim() || "Untitled Event"}
          </Text>

          <View style={styles.datePeopleRow}>
            <Text style={styles.dateText}>{dateString} | {timeString}</Text>
            <Text style={styles.separator}>|</Text>
            <Text style={styles.peopleText}>{invite.placeToPlay}</Text>
          </View>
        </View>

        {/* View Players Row */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onViewPlayers?.(invite.requestId);
          }}
          style={({ pressed }) => [
            styles.acceptedBox,
            pressed && styles.pressedStyle,
          ]}
        >
          <MaterialCommunityIcons name="account" size={14} color="#007BFF" />
          <Text style={styles.acceptedTextSmall}>{acceptedCount} / {totalPlayers} Accepted</Text>
        </Pressable>
      </View>
    </TouchableOpacity>
  );
};

export default OutgoingInviteCardItem;

const styles = StyleSheet.create({
  card: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 6,
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  placeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  datePeopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#555',
  },
  separator: {
    marginHorizontal: 4,
    fontSize: 14,
    color: '#555',
  },
  acceptedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7FF',
    borderRadius: 16,
    padding: 6,
  },
  acceptedTextSmall: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  pressedStyle: {
    opacity: 0.6,
    transform: [{ scale: 0.97 }],
  },  
  peopleText: {
    fontSize: 14,
    color: '#555',
  },
});
