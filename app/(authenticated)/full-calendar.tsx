import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import PlayCalendarCard from '@/components/home-page/PlayCalendarCard';
import { useGetInvitations } from '@/hooks/apis/invitations/useGetInvitations';
import { useGetPlayerInvitationSent } from '@/hooks/apis/player-finder/useGetPlayerInivitationsSent';
import { useGetPlays } from '@/hooks/apis/join-play/useGetPlays';
import { groupInviteeByRequestId } from '@/helpers/find-players/groupInviteeByRequestId';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import UserAvatar from '@/assets/UserAvatar';
import { LinearGradient } from 'expo-linear-gradient';

const FullCalendarPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: incoming } = useGetInvitations({ userId: user?.userId });
  const { data: outgoingRaw } = useGetPlayerInvitationSent({ inviteeEmail: user?.email });
  const { data: openPlays } = useGetPlays(user?.currentActiveClubId || 'GLOBAL', user?.userId);

  const groupedOutgoing = groupInviteeByRequestId(
    outgoingRaw?.filter((invite) => invite.status !== 'WITHDRAWN') || []
  );
  const outgoingInvites = Object.values(groupedOutgoing);

  const playCalendarData = [
    ...(incoming || []).map((invite) => ({
      ...invite,
      type: 'incoming' as const,
      playTime: invite.playTime || invite.request?.playTime || [],
      placeToPlay: invite.placeToPlay || invite.request?.placeToPlay || 'Unknown Location',
    })),
    ...outgoingInvites.map((invite) => ({
      ...invite,
      type: 'outgoing' as const,
      dateTimeMs: invite.dateTimeMs || null,
      placeToPlay: invite.placeToPlay || 'Unknown Location',
      accepted: invite.accepted ?? 0,
      playersNeeded: invite.playersNeeded ?? 1,
    })),
    ...(openPlays || []).map((session) => ({
      ...session,
      type: 'openplay' as const,
      playTime: session.startTime,
      placeToPlay: session.courtName ?? 'Unknown Court',
      eventName: session.sessionName ?? 'Unknown Play',
      isWaitlisted: session.waitlistedPlayers?.includes(user?.userId),
      accepted: session.registeredPlayers?.length ?? 0,
      playersNeeded: session.maxPlayers ?? 1,
      id: session.id,
    })),
  ];

  const getDateObject = (invite: any): Date | null => {
  if (invite.type === 'incoming' && Array.isArray(invite.playTime)) {
    const [year, month, day, hour = 0, min = 0, sec = 0] = invite.playTime;
    return new Date(year, month - 1, day, hour, min, sec);
  } else if (invite.type === 'openplay' && Array.isArray(invite.playTime)) {
  const [year, month, day, hour = 0, min = 0] = invite.playTime;
  return new Date(year, month - 1, day, hour, min);
  } else if (invite.type === 'outgoing' && invite.dateTimeMs) {
    return new Date(invite.dateTimeMs);
  }
  return null;
};


  const sortedCalendarData = [...playCalendarData].sort((a, b) => {
    const dateA = getDateObject(a)?.getTime() || 0;
    const dateB = getDateObject(b)?.getTime() || 0;
    return dateA - dateB;
  });

  return (
    <LinearGradient colors={['#E0F7FA', '#FFFFFF']} style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Full Play Calendar</Text>
          <TouchableOpacity onPress={() => router.push('/(authenticated)/profile')}>
            <UserAvatar size={36} />
          </TouchableOpacity>
        </View>

        {sortedCalendarData.length === 0 ? (
          <Text style={styles.noInvitesText}>No events found</Text>
        ) : (
          sortedCalendarData.map((invite, index) => (
            <View key={index} style={styles.cardContainer}>
              <PlayCalendarCard invites={[invite]} />
            </View>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default FullCalendarPage;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  noInvitesText: {
    textAlign: 'center',
    color: '#000',
    fontSize: 14,
    paddingVertical: 20,
  },
  cardContainer: {
    marginBottom: 16,
  },
});
