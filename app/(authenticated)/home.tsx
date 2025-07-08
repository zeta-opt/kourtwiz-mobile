import { useFetchUser } from '@/hooks/apis/authentication/useFetchUser';
import { useGetInvitations } from '@/hooks/apis/invitations/useGetInvitations';
import { getToken } from '@/shared/helpers/storeToken';
import { RootState } from '@/store';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import InvitationCard from '@/components/home-page/myInvitationsCard';

interface Invite {
  id: number;
  inviteeName: string;
  playTime: [number, number, number, number, number];
  acceptUrl: string;
  declineUrl: string;
  status: string;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const Dashboard = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const greeting = getGreeting();
  const { fetchUser } = useFetchUser();
  const router = useRouter();
  const { data: invites, refetch } = useGetInvitations({ userId: user?.userId });

  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleAccept = async (invite: Invite) => {
    try {
      setLoadingId(invite.id);
      const response = await fetch(invite.acceptUrl);
      if (response.status === 200) {
        Alert.alert('Success', 'Invitation accepted');
        refetch();
      } else {
        Alert.alert('Error', 'Failed to accept invitation');
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong while accepting');
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (invite: Invite) => {
    try {
      setLoadingId(invite.id);
      const response = await fetch(invite.declineUrl);
      if (response.status === 200) {
        Alert.alert('Success', 'Invitation rejected');
        refetch();
      } else {
        Alert.alert('Error', 'Failed to reject invitation');
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong while rejecting');
    } finally {
      setLoadingId(null);
    }
  };

  const pendingInvites = invites?.filter((inv) => inv.status === 'PENDING') ?? [];
  const pendingCount = pendingInvites.length;

  useEffect(() => {
    const loadUser = async () => {
      const token = await getToken();
      if (token) {
        await fetchUser();
      }
    };
    loadUser();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.text}>
        {greeting}
        {user?.username ? `, ${user.username.split(' ')[0]}` : ''} 👋
      </Text>

      {/* Incoming Requests */}
      <View style={styles.inviteWrapper}>
        <Text style={styles.incomingLabel}>Incoming Requests</Text>
        <View style={styles.inviteScrollContainer}>
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.inviteListContent}
          >
            {pendingInvites.map((invite) => (
              <InvitationCard
                key={invite.id}
                invite={invite}
                onAccept={handleAccept}
                onReject={handleReject}
                loading={loadingId === invite.id}
              />
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <TouchableOpacity onPress={() => console.log('DUPR Rating icon pressed')}>
            <Icon name="star-outline" size={24} color="#3F7CFF" />
          </TouchableOpacity>
          <Text style={styles.statValue}>--</Text>
          <Text style={styles.statLabel}>DUPR Rating</Text>
        </View>

        <View style={styles.statItem}>
          <TouchableOpacity onPress={() => console.log('Skill Level icon pressed')}>
            <Icon name="run-fast" size={24} color="#3F7CFF" />
          </TouchableOpacity>
          <Text style={styles.statValue}>
            {user?.playerDetails?.personalRating ?? '-'}
          </Text>
          <Text style={styles.statLabel}>Skill Level</Text>
        </View>

        <View style={styles.statItem}>
          <TouchableOpacity onPress={() => router.replace('/(authenticated)/player-invitations')}>
            <Icon name="email-outline" size={24} color="#3F7CFF" />
          </TouchableOpacity>
          <Text style={styles.statValue}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Invites</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.quickActionsTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#E6F0FF' }]}
          onPress={() => router.replace('/(authenticated)/court-booking')}
        >
          <Text style={styles.actionText}>Reserve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#E0FAEC' }]}
          onPress={() => router.replace('/(authenticated)/find-players')}
        >
          <Text style={styles.actionText}>Find Players</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#FFF2DB' }]}>
          <Text style={styles.actionText}>Find Game</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#F3E9FF' }]}
          onPress={() => router.replace('/(authenticated)/calendar')}
        >
          <Text style={styles.actionText}>My Videos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#F9F4EC' }]}>
          <Text style={styles.actionText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#FFE8EC' }]}
          onPress={() => router.replace('/(authenticated)/player-invitations')}
        >
          <Text style={styles.actionText}>Invites</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.upcomingGames}>Upcoming Games</Text>
      <Text style={styles.noGames}>No upcoming games</Text>
    </ScrollView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  inviteWrapper: {
    marginTop: 16,
    marginBottom: 24,
  },
  incomingLabel: {
    backgroundColor: '#FFEBEB',
    color: '#D8000C',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    borderRadius: 8,
    marginBottom: 8,
  },
  inviteScrollContainer: {
    backgroundColor: '#FFF7E6',
    borderRadius: 16,
    padding: 10,
    maxHeight: 240,
    overflow: 'hidden',
  },
  inviteListContent: {
    gap: 10,
    paddingBottom: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    paddingVertical: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontWeight: '600',
  },
  upcomingGames: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
  },
  noGames: {
    fontSize: 14,
    color: '#999',
    marginTop: 6,
  },
});
