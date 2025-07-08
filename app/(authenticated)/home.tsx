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
import { useTheme } from 'react-native-paper';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const Dashboard = () => {
  const { colors } = useTheme();
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
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <Text style={[styles.text, { color: colors.onBackground }]}>
        {greeting}
        {user?.username ? `, ${user.username.split(' ')[0]}` : ''} 👋
      </Text>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <TouchableOpacity
            onPress={() => console.log('DUPR Rating icon pressed')}
          >
            <Icon name="star-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.statValue, { color: colors.onBackground }]}>
            --
          </Text>
          <Text style={[styles.statLabel, { color: colors.outline }]}>
            DUPR Rating
          </Text>
        </View>

        <View style={styles.statItem}>
          <TouchableOpacity
            onPress={() => console.log('Skill Level icon pressed')}
          >
            <Icon name="run-fast" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.statValue, { color: colors.onBackground }]}>
            {user?.playerDetails?.personalRating ?? '-'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.outline }]}>
            Skill Level
          </Text>
        </View>

        <View style={styles.statItem}>
          <TouchableOpacity
            onPress={() =>
              router.replace('/(authenticated)/player-invitations')
            }
          >
            <Icon name="email-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.statValue, { color: colors.onBackground }]}>
            {pendingCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.outline }]}>
            Invites
          </Text>
        </View>
      </View>

      <Text
        style={[styles.quickActionsTitle, { color: colors.onBackground }]}
      >
        Quick Actions
      </Text>

      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#E6F0FF' }]}
          onPress={() => router.replace('/(authenticated)/court-booking')}
        >
          <Text style={[styles.actionText, { color: '#000' }]}>Reserve</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#E0FAEC' }]}
          onPress={() => router.replace('/(authenticated)/find-players')}
        >
          <Text style={[styles.actionText, { color: '#000' }]}>
            Find Players
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#FFF2DB' }]}
        >
          <Text style={[styles.actionText, { color: '#000' }]}>Find Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#F3E9FF' }]}
          onPress={() => router.replace('/(authenticated)/calendar')}
        >
          <Text style={[styles.actionText, { color: '#000' }]}>My Videos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#F9F4EC' }]}
        >
          <Text style={[styles.actionText, { color: '#000' }]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#FFE8EC' }]}
          onPress={() => router.replace('/(authenticated)/player-invitations')}
        >
          <Text style={[styles.actionText, { color: '#000' }]}>Invites</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.upcomingGames, { color: colors.onBackground }]}>
        Upcoming Games
      </Text>
      <Text style={[styles.noGames, { color: colors.outline }]}>
        No upcoming games
      </Text>
    </ScrollView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
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
    marginTop: 6,
  },
});
