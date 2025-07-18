import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

export type Invite = {
  requestId: string;
  playTime: [number, number, number, number?, number?]; // [YYYY, MM, DD, HH?, MM?]
  placeToPlay: string;
  dateTimeMs: number;
  accepted: number;
  Requests: {
    playersNeeded: number;
  }[];
};

type OutgoingInvitationCardProps = {
  invites: Invite[];
};

export const OutgoingInvitationCard: React.FC<OutgoingInvitationCardProps> = ({ invites }) => {
  const router = useRouter();

  const formatDateParts = (timestamp: number) => {
    const dateObj = new Date(timestamp);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    const dateString = `${day}/${month}/${year}`;
    const timeString = dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return { dateString, timeString };
  };

  return (
    <View style={styles.container}>
      {invites.map((gameInvite, index) => {
        const request = gameInvite.Requests?.[0];
        const acceptedCount = gameInvite.accepted || 0;
        const totalPlayers = request?.playersNeeded || 0;

        const isFullyAccepted = acceptedCount === totalPlayers;
        const statusText = isFullyAccepted ? 'Accepted' : 'Pending';
        const statusColor = isFullyAccepted ? '#429645' : '#c47602';

        const peopleText = `${totalPlayers} ${totalPlayers === 1 ? 'Person' : 'People'} Invited`;
        const { dateString, timeString } = formatDateParts(gameInvite.dateTimeMs);

        const onPress = () => {
          const encoded = encodeURIComponent(JSON.stringify(gameInvite));
          router.push(`/invite-summary?data=${encoded}`);
        };

        return (
          <View key={`${gameInvite.requestId}-${index}`} style={styles.card} onTouchEnd={onPress}>
            <View style={styles.statusBadgeContainer}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusBadgeText}>
                  {acceptedCount}/{totalPlayers} {statusText}
                </Text>
              </View>
            </View>

            <Text style={styles.placeText} numberOfLines={1}>
              {gameInvite.placeToPlay}
            </Text>

            <View style={styles.datePeopleRow}>
              <Text style={styles.dateText}>{dateString} | {timeString}</Text>
              <Text style={styles.separator}>|</Text>
              <Text style={styles.peopleText}>{peopleText}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
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
    fontSize: 13,
    color: '#555',
  },
  separator: {
    marginHorizontal: 8,
    fontSize: 14,
    color: '#bbb',
  },
  peopleText: {
    fontSize: 13,
    color: '#555',
  },
});
