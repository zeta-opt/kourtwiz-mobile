import FindplayerCard from '@/components/home-page/FindplayerCard';
import InvitationCard from '@/components/home-page/myInvitationsCard';
import OpenPlayCard from '@/components/home-page/openPlayCard';
import { OutgoingInvitationCard } from '@/components/home-page/outgoingInvitationsCard';
import { groupInviteeByRequestId } from '@/helpers/find-players/groupInviteeByRequestId';
import { useGetPlayerInvitationSent } from '@/hooks/apis/player-finder/useGetPlayerInivitationsSent';
import { useGetPlays } from '@/hooks/apis/join-play/useGetPlays';
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
import axios from 'axios';

const API_URL = 'http://44.216.113.234:8080';

interface Invite {
  id: number;
  requestId: string;
  inviteeName: string;
  playTime: [number, number, number, number, number];
  placeToPlay: string;
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
  const clubId = user?.currentActiveClubId;
  const { data: openPlayInvites = [] } = useGetPlays(clubId);

  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'INCOMING' | 'OUTGOING' | 'OPENPLAY'>('INCOMING');
  const [selectedInvite, setSelectedInvite] = useState<any>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedAction, setSelectedAction] = useState<'accept' | 'reject' | null>(null);

  const [playerCounts, setPlayerCounts] = useState<{ [key: string]: { accepted: number; total: number } }>({});

  const groupedOutgoing = groupInviteeByRequestId(
    outgoingInvitesRaw?.filter((invite) => invite.status !== 'WITHDRAWN') || []
  );
  const outgoingInvites = Object.values(groupedOutgoing);
  const pendingOutCount = outgoingInvites.length;

  const allInvites = invites ?? [];

  useEffect(() => {
    const loadUser = async () => {
      const token = await getToken();
      if (token) await fetchUser();
    };
    loadUser();
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      const newCounts: { [key: string]: { accepted: number; total: number } } = {};
      for (const invite of allInvites) {
        try {
          const token = await getToken();
          const res = await axios.get(`${API_URL}/api/player-tracker/tracker/request`, {
            params: { requestId: invite.requestId },
            headers: { Authorization: `Bearer ${token}` },
          });

          const total = res.data.length;
          const accepted = res.data.filter((p: any) => p.status === 'ACCEPTED').length;

          newCounts[invite.requestId] = { accepted, total };
        } catch (error) {
          newCounts[invite.requestId] = { accepted: 0, total: 1 };
        }
      }
      setPlayerCounts(newCounts);
    };

    if (allInvites.length > 0) {
      fetchCounts();
    }
  }, [allInvites]);

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
        Alert.alert('Error', `Failed to ${selectedAction} invitation. You may have another event at the same time.`);
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
      <LinearGradient colors={['#E0F7FA', '#FFFFFF']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.inviteWrapper}>
            <View style={styles.tabRow}>
              <View style={styles.chipGroup}>
                <Text
                  style={[
                    styles.chip,
                    activeTab === 'INCOMING' ? styles.chipActive : styles.chipInactive,
                  ]}
                  onPress={() => setActiveTab('INCOMING')}
                >
                  Incoming Request ({allInvites.length})
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
                <Text
                  style={[
                    styles.chip,
                    activeTab === 'OPENPLAY' ? styles.chipActive : styles.chipInactive,
                  ]}
                  onPress={() => setActiveTab('OPENPLAY')}
                >
                  Open Play ({pendingOutCount})
                </Text>
              </View>

              {(activeTab === 'INCOMING' && allInvites.length > 0) ||
              (activeTab === 'OUTGOING' && outgoingInvites.length > 0) ||
              (activeTab === 'OPENPLAY' && outgoingInvites.length > 0) ? (
                <TouchableOpacity
                  onPress={() =>
                    router.replace(
                      activeTab === 'INCOMING'
                        ? '/(authenticated)/player-invitations'
                        : '/(authenticated)/find-players'
                    )
                  }
                >
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <LinearGradient colors={['#E0F7FA', '#FFFFFF']} style={styles.inviteScrollContainer}>
              <ScrollView nestedScrollEnabled contentContainerStyle={styles.inviteListContent}>
                {activeTab === 'INCOMING' ? (
                  allInvites.length === 0 ? (
                    <Text style={styles.noInvitesText}>No incoming invitations</Text>
                  ) : (
                    allInvites.map((invite) => (
                      <InvitationCard
                        key={invite.id}
                        invite={invite}
                        onAccept={() => showCommentDialog(invite, 'accept')}
                        onReject={() => showCommentDialog(invite, 'reject')}
                        loading={loadingId === invite.id}
                        totalPlayers={playerCounts[invite.requestId]?.total ?? 1}
                        acceptedPlayers={playerCounts[invite.requestId]?.accepted ?? 0}
                      />
                    ))
                  )
                ) : activeTab === 'OUTGOING' ? (
                  outgoingInvites.length === 0 ? (
                    <Text style={styles.noInvitesText}>No sent invitations</Text>
                  ) : (
                    <OutgoingInvitationCard invites={outgoingInvites} onPressCard={() => {}} />
                  )
                ) : (
                  <OpenPlayCard />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chipGroup: {
    flexDirection: 'row',
    flexShrink: 1,
    maxWidth: '80%',
    overflow: 'hidden',
    gap: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom:1,
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
