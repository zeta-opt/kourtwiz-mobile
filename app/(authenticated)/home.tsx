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
import { useSelector } from 'react-redux';
import {
  Dialog,
  Portal,
  TextInput,
  Button,
  Provider as PaperProvider,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

interface Invite {
  id: number;
  inviteeName: string;
  playTime: [number, number, number, number, number];
  acceptUrl: string;
  declineUrl: string;
  status: string;
}

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
  const pendingOutCount = pendingOutgoingInvites.length;
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
      const baseUrl =
        selectedAction === 'accept' ? selectedInvite.acceptUrl : selectedInvite.declineUrl;
      const url = `${baseUrl}&comments=${encodeURIComponent(comment)}`;
      const response = await fetch(url);
      if (response.status === 200) {
        Alert.alert('Success', `Invitation ${selectedAction}ed`);
        refetch();
      } else {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        Alert.alert('Error', `Failed to ${selectedAction} invitation, You have already have another event in the same time`);
      }
    } catch (e) {
      Alert.alert('Error', `Something went wrong while trying to ${selectedAction}`);
    } finally {
      setLoadingId(null);
      setDialogVisible(false);
    }
  };
  const validPendingInvites = pendingInvites.filter((invite) => {
    const [y, m, d, h, min] = invite.playTime;
    return new Date(y, m - 1, d, h, min).getTime() > Date.now();
  });  

  return (
    <PaperProvider>
      <LinearGradient colors={['#E0F7FA', '#FFFFFF']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.inviteWrapper}>
            <View style={styles.tabRow}>
              <Text
                style={[
                  styles.chip,
                  activeTab === 'INCOMING' ? styles.chipActive : styles.chipInactive,
                ]}
                onPress={() => setActiveTab('INCOMING')}
              >
                Incoming Request ({pendingCount})
              </Text>
              <Text
                style={[
                  styles.chip,
                  activeTab === 'OUTGOING' ? styles.chipActive : styles.chipInactive,
                ]}
                onPress={() => setActiveTab('OUTGOING')}
              >
                Sent Request ({pendingOutCount})
              </Text>
            </View>

            <LinearGradient colors={['#E0F7FA', '#FFFFFF']} style={styles.inviteScrollContainer}>
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
                validPendingInvites.length === 0 ? (
                  <Text style={styles.noInvitesText}>No incoming invitations</Text>
                ) : (
                  validPendingInvites.map((invite) => (
                    <InvitationCard
                      key={invite.id}
                      invite={invite}
                      onAccept={() => showCommentDialog(invite, 'accept')}
                      onReject={() => showCommentDialog(invite, 'reject')}
                      loading={loadingId === invite.id}
                    />
                  ))
                )
                ) : outgoingInvites.length === 0 ? (
                  <Text style={styles.noInvitesText}>No sent invitations</Text>
                ) : (
                  <OutgoingInvitationList invites={outgoingInvites} onPressCard={() => {}} />
                )}
              </ScrollView>
            </LinearGradient>
          </View>

          <FindplayerCard />
          <Text style={styles.upcomingGames}>Upcoming Games</Text>
          <Text style={styles.noGames}>No upcoming games</Text>

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
      </LinearGradient>
    </PaperProvider>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1 },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#E6F9FF',
    borderColor: '#0099B8',
    color: '#0099B8',
  },
  chipInactive: {
    backgroundColor: '#F0F0F0',
    borderColor: '#F0F0F0',
    color: '#888888',
  },
  inviteWrapper: {
    marginTop: 16,
    marginBottom: 24,
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
    borderRadius: 16,
    padding: 10,
    maxHeight: 240,
    overflow: 'hidden',
  },
  inviteListContent: {
    gap: 10,
    paddingBottom: 6,
  },
  noInvitesText: {
    textAlign: 'center',
    color: '#000000',
    fontSize: 14,
    paddingVertical: 20,
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
