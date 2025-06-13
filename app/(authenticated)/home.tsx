import { useFetchUser } from '@/hooks/apis/authentication/useFetchUser';
import { useGetInvitations } from '@/hooks/apis/invitations/useGetInvitations';
import { getToken } from '@/shared/helpers/storeToken';
import { RootState } from '@/store';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';

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
  const { data: invites } = useGetInvitations({ userId: user?.userId });

  const pendingCount =
    invites?.reduce((count, invite) => {
      if (invite.status === 'PENDING') {
        return count + 1;
      }
      return count;
    }, 0) ?? '--';
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

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <TouchableOpacity
            onPress={() => console.log('DUPR Rating icon pressed')}
          >
            <Icon name='star-outline' size={24} color='#3F7CFF' />
          </TouchableOpacity>
          <Text style={styles.statValue}>--</Text>
          <Text style={styles.statLabel}>DUPR Rating</Text>
        </View>

        <View style={styles.statItem}>
          <TouchableOpacity
            onPress={() => console.log('Skill Level icon pressed')}
          >
            <Icon name='run-fast' size={24} color='#3F7CFF' />
          </TouchableOpacity>
          <Text style={styles.statValue}>
            {user?.playerDetails?.personalRating ?? '-'}
          </Text>
          <Text style={styles.statLabel}>Skill Level</Text>
        </View>

        <View style={styles.statItem}>
          <TouchableOpacity
            onPress={() =>
              router.replace('/(authenticated)/player-invitations')
            }
          >
            <Icon name='email-outline' size={24} color='#3F7CFF' />
          </TouchableOpacity>
          <Text style={styles.statValue}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Invites</Text>
        </View>
      </View>

      <Text style={styles.quickActionsTitle}>Quick Actions</Text>

      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#E6F0FF' }]}
        >
          <Text style={styles.actionText}>Reserve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#E0FAEC' }]}
          onPress={() => router.replace('/(authenticated)/find-players')}
        >
          <Text style={styles.actionText}>Find Players</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#FFF2DB' }]}
        >
          <Text style={styles.actionText}>Find Game</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#F3E9FF' }]}
        >
          <Text style={styles.actionText}>My Videos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#F9F4EC' }]}
        >
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
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
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
