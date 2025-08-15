import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const PlayCalendarCard = ({ invites }: { invites: any[] }) => {
  const router = useRouter();

  const renderStatusBadge = (status: string) => {
    let backgroundColor = '#e0e0e0';
    let textColor = '#000';

    switch (status?.toLowerCase()) {
      case 'accepted':
        backgroundColor = '#D3F5EF';
        textColor = '#229476';
        break;
      case 'pending':
        backgroundColor = '#FCECD9';
        textColor = '#D18F00';
        break;
      case 'waitlisted':
        backgroundColor = '#FEF3DC';
        textColor = '#B26A00';
        break;
      case 'declined':
        backgroundColor = '#FCE8E6';
        textColor = 'red';
        break;
    }

    return (
      <View style={[styles.badge, { backgroundColor }]}>
        <Text style={[styles.badgeText, { color: textColor }]}>
          {status}
        </Text>
      </View>
    );
  };

  const getDateObject = (invite: any): Date | null => {
  if (invite.type === 'incoming' && Array.isArray(invite.playTime)) {
    const [year, month, day, hour = 0, min = 0, sec = 0] = invite.playTime;
    return new Date(year, month - 1, day, hour, min, sec);
  } else if (invite.type === 'openplay' && Array.isArray(invite.playTime)) {
    const [year, month, day, hour = 0, min = 0] = invite.playTime;
    return new Date(year, month - 1, day, hour, min);
  } else if (invite.dateTimeMs) {
    return new Date(invite.dateTimeMs);
  }
  return null;
};
  const now = new Date();
now.setHours(0, 0, 0, 0);

const filteredInvites = invites.filter((invite) => {
  const dateObj = getDateObject(invite);
  return dateObj && dateObj >= now;
});
  const sortedInvites = [...filteredInvites].sort((a, b) => {
    const dateA = getDateObject(a)?.getTime() || 0;
    const dateB = getDateObject(b)?.getTime() || 0;
    return dateA - dateB;
  });

  const renderInviteRow = (invite: any, index: number) => {
    const { type } = invite;
    const dateObj = getDateObject(invite);

    const place =
      invite.placeToPlay || invite.request?.placeToPlay || 'Unknown Location';

    const dateString = dateObj
      ? dateObj.toLocaleDateString(undefined, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : 'Unknown';

    const timeString = dateObj
      ? dateObj.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Unknown';

    let statusText = 'Unknown';
    if (type === 'incoming') {
      statusText = invite.status || 'N/A';
    } else {
      const accepted = invite.accepted ?? 0;
      const playersNeeded = invite.playersNeeded ?? 1;
      const isFull = accepted >= playersNeeded;
      statusText = invite.isWaitlisted ? 'WAITLISTED' : isFull ? 'ACCEPTED' : 'PENDING';
    }

    const eventName =
      invite.eventName ||
      invite.request?.eventName ||
      (type === 'openplay' ? 'Unknown Play' : 'Event Name');

    const handlePress = () => {
      try {
        if (type === 'incoming') {
          router.push({
            pathname: '/(authenticated)/myRequestsDetailedView',
            params: { requestId: invite.requestId },
          });
        } else if (type === 'outgoing') {
          const encoded = encodeURIComponent(JSON.stringify(invite));
          router.push({
            pathname: '/(authenticated)/sentRequestsDetailedView',
            params: { data: encoded },
          });
        } else if (type === 'openplay') {
          router.push({
            pathname: '/(authenticated)/openPlayDetailedView',
            params: { sessionId: invite.id },
          });
        }
      } catch (err) {
        console.error('Navigation error:', err);
      }
    };

    return (
      <TouchableOpacity key={index} style={styles.row} activeOpacity={0.8} onPress={handlePress}>
        <View style={{ flex: 1 }}>
          <View style={styles.rowTop}>
            <Text style={styles.title}>{eventName}</Text>
            {renderStatusBadge(statusText)}
          </View>
          <Text style={styles.subtitle}>
            {dateString} | {place}
          </Text>
        </View>
        <View style={styles.timeContainer}>
          <MaterialIcons name="access-time" size={16} color="#555" />
          <Text style={styles.timeText}>{timeString}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {sortedInvites.map((invite, index) => renderInviteRow(invite, index))}
    </View>
  );
};

export default PlayCalendarCard;

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 16,
    gap: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  subtitle: {
    fontSize: 12,
    color: '#555',
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#555',
  },
});
