import FindplayerCard from '@/components/home-page/FindplayerCard';
import InvitationCard from '@/components/home-page/myInvitationsCard';
import { OutgoingInvitationList } from '@/components/home-page/outgoingInvitationsList';
import { groupInviteeByRequestId } from '@/helpers/find-players/groupInviteeByRequestId';
import { useGetPlayerInvitationSent } from '@/hooks/apis/player-finder/useGetPlayerInivitationsSent';
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
import { Dialog, Portal, TextInput, Button, Provider as PaperProvider } from 'react-native-paper';

interface Invite {
  id: number;
  inviteeName: string;
  playTime: [number, number, number, number, number];
  acceptUrl: string;
  declineUrl: string;
  status: string;
}

// const getGreeting = () => {
//   const hour = new Date().getHours();
//   if (hour < 12) return 'Good morning';
//   if (hour < 17) return 'Good afternoon';
//   return 'Good evening';
// };

const Dashboard = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { fetchUser } = useFetchUser();
  const router = useRouter();

  const { data: invites, refetch } = useGetInvitations({ userId: user?.userId });
  const { data: outgoingInvitesRaw } = useGetPlayerInvitationSent({
    inviteeEmail: user?.email,
  });

  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'INCOMING' | 'OUTGOING'>('INCOMING');
  const [selectedInvite, setSelectedInvite] = useState<any>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedAction, setSelectedAction] = useState<'accept' | 'reject' | null>(null);

  const groupedOutgoing = groupInviteeByRequestId(
    outgoingInvitesRaw?.filter((invite) => invite.status !== 'WITHDRAWN') || []
  );
  const outgoingInvites = Object.values(groupedOutgoing);
  const pendingOutgoingInvites = outgoingInvites.filter((inviteGroup: any) =>
    inviteGroup.Requests?.some((r: any) => r.status === 'PENDING')
  );
  const pendingOutCount = pendingOutgoingInvites.length
  const pendingInvites = invites?.filter((inv) => inv.status === 'PENDING') ?? [];
  const pendingCount = pendingInvites.length;

  useEffect(() => {
    const loadUser = async () => {
      const token = await getToken();
      if (token) await fetchUser();
    };
    loadUser();
  }, []);

  const showCommentDialog = (invite: Invite, action: 'accept' | 'reject') => {
    setSelectedInvite(invite);
    setSelectedAction(action);
    setDialogVisible(true);
    setComment('');
  };

  const handleDialogSubmit = async () => {
    if (!selectedInvite || !selectedAction) return;

    try {
      setLoadingId(selectedInvite.id);

      const baseUrl = selectedAction === 'accept' ? selectedInvite.acceptUrl : selectedInvite.declineUrl;
      const url = `${baseUrl}&comments=${encodeURIComponent(comment)}`;

      const response = await fetch(url);
      if (response.status === 200) {
        Alert.alert('Success', `Invitation ${selectedAction}ed`);
        refetch();
      } else {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        Alert.alert('Error', `Failed to ${selectedAction} invitation or conflict exists`);
      }
    } catch (e) {
      Alert.alert('Error', `Something went wrong while trying to ${selectedAction}`);
    } finally {
      setLoadingId(null);
      setDialogVisible(false);
    }
  };

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.inviteWrapper}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <Text
              style={[styles.labelChip, activeTab === 'INCOMING' && styles.activeChip]}
              onPress={() => setActiveTab('INCOMING')}
            >
              Incoming Requests ({pendingCount})
            </Text>
            <Text
              style={[styles.labelChip, activeTab === 'OUTGOING' && styles.activeChip]}
              onPress={() => setActiveTab('OUTGOING')}
            >
              Sent Requests ({pendingOutCount})
            </Text>
          </View>

          <View style={styles.inviteScrollContainer}>
            {(activeTab === 'INCOMING' && pendingInvites.length > 0) ||
            (activeTab === 'OUTGOING' && outgoingInvites.length > 0) ? (
              <View style={styles.cardHeaderRight}>
                <TouchableOpacity
                  onPress={() =>
                    router.push(
                      activeTab === 'INCOMING'
                        ? '/(authenticated)/player-invitations'
                        : '/(authenticated)/find-players'
                    )
                  }
                >
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <ScrollView nestedScrollEnabled contentContainerStyle={styles.inviteListContent}>
              {activeTab === 'INCOMING' ? (
                pendingInvites.length === 0 ? (
                  <Text style={styles.noInvitesText}>No incoming invitations</Text>
                ) : (
                  pendingInvites.map((invite) => (
                    <InvitationCard
                      key={invite.id}
                      invite={invite}
                      onAccept={() => showCommentDialog(invite, 'accept')}
                      onReject={() => showCommentDialog(invite, 'reject')}
                      loading={loadingId === invite.id}
                    />
                  ))
                )
              ) : (
                outgoingInvites.length === 0 ? (
                  <Text style={styles.noInvitesText}>No sent invitations</Text>
                ) : (
                  <OutgoingInvitationList invites={outgoingInvites} onPressCard={() => {}} />
                )
              )}
            </ScrollView>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <TouchableOpacity><Icon name='star-outline' size={24} color='#3F7CFF' /></TouchableOpacity>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>DUPR Rating</Text>
          </View>
          <View style={styles.statItem}>
            <TouchableOpacity><Icon name='run-fast' size={24} color='#3F7CFF' /></TouchableOpacity>
            <Text style={styles.statValue}>{user?.playerDetails?.personalRating ?? '-'}</Text>
            <Text style={styles.statLabel}>Skill Level</Text>
          </View>
          <View style={styles.statItem}>
            <TouchableOpacity onPress={() => router.replace('/(authenticated)/player-invitations')}>
              <Icon name='email-outline' size={24} color='#3F7CFF' />
            </TouchableOpacity>
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Invites</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#E6F0FF' }]} onPress={() => router.replace('/(authenticated)/court-booking')}>
            <Text style={styles.actionText}>Reserve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#E0FAEC' }]} onPress={() => router.replace('/(authenticated)/find-players')}>
            <Text style={styles.actionText}>Find Players</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#FFF2DB' }]}>
            <Text style={styles.actionText}>Find Game</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#F3E9FF' }]} onPress={() => router.replace('/(authenticated)/calendar')}>
            <Text style={styles.actionText}>My Videos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#F9F4EC' }]}>
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#FFE8EC' }]} onPress={() => router.replace('/(authenticated)/player-invitations')}>
            <Text style={styles.actionText}>Invites</Text>
          </TouchableOpacity>
        </View>

        <FindplayerCard />
        <Text style={styles.upcomingGames}>Upcoming Games</Text>
        <Text style={styles.noGames}>No upcoming games</Text>

        {/* Comment Dialog */}
        <Portal>
          <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
            <Dialog.Title>Add a message</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Comment (optional)"
                value={comment}
                onChangeText={setComment}
                mode="outlined"
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
              <Button onPress={handleDialogSubmit}>Submit</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </PaperProvider>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  labelChip: {
    backgroundColor: '#FFEBEB',
    color: '#D8000C',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    borderRadius: 8,
  },
  activeChip: { borderWidth: 1, borderColor: '#D8000C' },
  inviteWrapper: { marginTop: 16, marginBottom: 24 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    paddingHorizontal: 2,
  },
  cardHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  cardHeaderRight: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingBottom: 8,
  paddingHorizontal: 2,
},

  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3F7CFF',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  inviteScrollContainer: {
    backgroundColor: '#FFF7E6',
    borderRadius: 16,
    padding: 10,
    maxHeight: 240,
    overflow: 'hidden',
  },
  inviteListContent: { gap: 10, paddingBottom: 6 },
  noInvitesText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 20,
  },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: '600' },
  statLabel: { fontSize: 12, color: '#777', marginTop: 4 },
  quickActionsTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: {
    width: '48%',
    paddingVertical: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: { fontWeight: '600' },
  upcomingGames: { fontSize: 18, fontWeight: '600', marginTop: 24 },
  noGames: { fontSize: 14, color: '#999', marginTop: 6 },
});
