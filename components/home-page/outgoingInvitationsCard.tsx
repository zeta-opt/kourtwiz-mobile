import { getToken } from '@/shared/helpers/storeToken';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';

const API_URL = 'https://api.vddette.com';

export type Invite = {
  requestId: string;
  playTime: [number, number, number, number?, number?] | string | null;
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
  onInviteUpdate?: (invite: Invite) => void;
};

const parsePlayTimeToMs = (playTime: any): number => {
  if (!playTime) return Date.now();
  if (Array.isArray(playTime)) {
    const [y, m, d, h = 0, min = 0, s = 0] = playTime;
    return new Date(y, (m as number) - 1, d, h, min, s).getTime();
  }
  const t = new Date(playTime).getTime();
  return Number.isFinite(t) ? t : Date.now();
};

const OutgoingInviteCardItem: React.FC<OutgoingInviteCardItemProps> = ({
  invite,
  disabled = false,
  onViewPlayers,
  onInviteUpdate,
}) => {
  const router = useRouter();

  // local copy of invite that we update after a fetch
  const [inviteData, setInviteData] = useState<Invite>(() => ({
    ...invite,
    Requests: invite.Requests || [],
    dateTimeMs: invite.dateTimeMs || parsePlayTimeToMs(invite.playTime),
  }));

  // loaders
  const [loadingCard, setLoadingCard] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  useEffect(() => {
    setInviteData((prev) => {
      if (!prev || prev.requestId !== invite.requestId) {
        return {
          ...invite,
          Requests: invite.Requests || [],
          dateTimeMs: invite.dateTimeMs || parsePlayTimeToMs(invite.playTime),
        };
      }
      return prev;
    });
  }, [invite.requestId]);

  // compute displayed counts preferring Requests if present
  const computeCountsFromRequests = (
    requests: any[],
    playersNeededFallback: number
  ) => {
    const acceptedRaw = (requests || []).filter(
      (p) => (p.status ?? '').toUpperCase() === 'ACCEPTED'
    ).length;
    const accepted = acceptedRaw + 1; // keep your +1 behaviour if you want organizer counted
    const total = (requests[0]?.playersNeeded ?? playersNeededFallback) + 1;
    return { accepted, total };
  };

  const baseAccepted =
    typeof inviteData.accepted === 'number' ? inviteData.accepted : 0;
  const baseTotal =
    typeof inviteData.playersNeeded === 'number' ? inviteData.playersNeeded : 0;

  let displayedAccepted = baseAccepted;
  let displayedTotal = baseTotal;
  if (inviteData.Requests && inviteData.Requests.length > 0) {
    const computed = computeCountsFromRequests(
      inviteData.Requests,
      inviteData.playersNeeded || baseTotal
    );
    displayedAccepted = computed.accepted;
    displayedTotal = computed.total;
  }

  const isFullyAccepted = displayedAccepted === displayedTotal;
  const statusText = isFullyAccepted ? 'Accepted' : 'Pending';
  const statusColor = isFullyAccepted ? '#429645' : '#c47602';
  const statusCount = isFullyAccepted
    ? `${displayedAccepted}/${displayedTotal}`
    : `${displayedTotal - displayedAccepted}/${displayedTotal}`;

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

  const { dateString, timeString } = formatDateParts(
    inviteData.dateTimeMs || Date.now()
  );

  // fetch fresh invite and return structured result (do NOT rely on inviteData after this — use returned value)
  const fetchFreshInviteAndMerge = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${API_URL}/api/player-tracker/tracker/request`,
        {
          params: { requestId: inviteData.requestId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const payload = Array.isArray(res.data)
        ? res.data
        : res.data?.results ?? res.data;
      const first =
        Array.isArray(payload) && payload.length > 0 ? payload[0] : null;

      const accCount = Array.isArray(payload)
        ? payload.filter(
            (p: any) => (p.status ?? '').toUpperCase() === 'ACCEPTED'
          ).length + 1
        : inviteData.accepted;

      const newInvite: Invite = {
        ...inviteData,
        Requests: Array.isArray(payload) ? payload : inviteData.Requests,
        playersNeeded: first?.playersNeeded ?? inviteData.playersNeeded,
        eventName: first?.eventName ?? inviteData.eventName,
        placeToPlay: first?.placeToPlay ?? inviteData.placeToPlay,
        dateTimeMs: first?.playTime
          ? parsePlayTimeToMs(first.playTime)
          : inviteData.dateTimeMs,
        accepted: accCount,
      };

      // set local state (so UI updates)
      setInviteData(newInvite);
      if (onInviteUpdate) {
        onInviteUpdate(newInvite);
      }

      return {
        success: true,
        invite: newInvite,
        players: Array.isArray(payload) ? payload : [],
      };
    } catch (err) {
      console.error('fetchFreshInviteAndMerge error', err);
      return { success: false, error: err, invite: null, players: [] };
    }
  };

  // full card press: fetch fresh, update local, then navigate using returned fresh invite
  const handlePressUpdate = async () => {
    if (!inviteData) return;
    setLoadingCard(true);
    try {
      const { success, invite: freshInvite } = await fetchFreshInviteAndMerge();
      const toEncode = success && freshInvite ? freshInvite : inviteData;
      const encoded = encodeURIComponent(JSON.stringify(toEncode));
      router.push({
        pathname: '/(authenticated)/sentRequestsDetailedView',
        params: { data: encoded },
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch and open invite');
      console.error(err);
    } finally {
      setLoadingCard(false);
    }
  };

  // view players press: fetch fresh, update local, then call parent with requestId (parent fetches if needed)
  const handleViewPlayersPress = async (e: any) => {
    e.stopPropagation();
    setLoadingPlayers(true);
    try {
      const { success, invite: freshInvite } = await fetchFreshInviteAndMerge();
      if (success && freshInvite) {
        onViewPlayers(freshInvite.requestId);
      } else {
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch players');
      console.error(err);
    } finally {
      setLoadingPlayers(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      disabled={disabled || loadingCard}
      onPress={handlePressUpdate}
      activeOpacity={0.9}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.statusBadgeContainer}>
            <View
              style={[styles.statusBadge, { backgroundColor: statusColor }]}
            >
              <Text style={styles.statusBadgeText}>
                {statusCount} {statusText}
              </Text>
            </View>
          </View>

          <Text style={styles.placeText} numberOfLines={1}>
            {inviteData.eventName?.trim() || 'Untitled Event'}
          </Text>

          <View style={styles.datePeopleRow}>
            <Text style={styles.dateText}>
              {dateString} | {timeString}
            </Text>
            <Text style={styles.separator}>|</Text>
            <Text
              style={styles.peopleText}
              numberOfLines={1}
              ellipsizeMode='tail'
            >
              {inviteData.placeToPlay}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleViewPlayersPress}
          style={({ pressed }) => [
            styles.acceptedBox,
            pressed && styles.pressedStyle,
          ]}
        >
          <MaterialCommunityIcons name='account' size={14} color='#2C7E88' />
          <Text style={styles.acceptedTextSmall}>
            {displayedAccepted} / {displayedTotal} Accepted
          </Text>
        </Pressable>
      </View>

      {loadingCard && (
        <View style={styles.cardLoaderOverlay}>
          <ActivityIndicator size='large' color='#2C7E88' />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default OutgoingInviteCardItem;

const styles = StyleSheet.create({
  card: {
     paddingVertical: 12,
    // paddingHorizontal: 16,
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
  cardLoaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});
