import FindplayerCard from '@/components/home-page/FindplayerCard';
import InvitationCard from '@/components/home-page/myInvitationsCard';
import NewMessages from '@/components/home-page/NewMessages';
import OpenPlayCard from '@/components/home-page/openPlayCard';
import OutgoingInviteCardItem from '@/components/home-page/outgoingInvitationsCard';
import PlayCalendarCard from '@/components/home-page/PlayCalendarCard';
import PlayerDetailsModal from '@/components/home-page/PlayerDetailsModal';
import { groupInviteeByRequestId } from '@/helpers/find-players/groupInviteeByRequestId';
import { useFetchUser } from '@/hooks/apis/authentication/useFetchUser';
import { useGetInvitations } from '@/hooks/apis/invitations/useGetInvitations';
import { useGetPlays } from '@/hooks/apis/join-play/useGetPlays';
import { useGetInitiatedPlays } from '@/hooks/apis/join-play/useGetInitiatedPlays';
import { useGetPlayerInvitationSent } from '@/hooks/apis/player-finder/useGetPlayerInivitationsSent';
import { getToken } from '@/shared/helpers/storeToken';
import { RootState } from '@/store';
import { resetInvitationsRefetch } from '@/store/refetchSlice';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
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
import {
  Button,
  Dialog,
  Modal,
  Provider as PaperProvider,
  Portal,
  TextInput,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux'; // ADD useDispatch

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
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { fetchUser } = useFetchUser();
  const router = useRouter();
  const isFocused = useIsFocused();

  const { data: invites, refetch } = useGetInvitations({
    userId: user?.userId,
  });
  const { data: outgoingInvitesRaw, refetch: refetchOutgoing } = useGetPlayerInvitationSent({
      inviteeEmail: user?.email,
    });
  const clubId = user?.currentActiveClubId;
  const userId = user?.userId;
  const openClubId = user?.currentActiveClubId || 'GLOBAL';
  const { data: openPlayInvites, status , error, refetch:refetchOpenPlay } = useGetPlays(openClubId,userId);
  const { data: initiatedPlays, refetch: refetchInitiatedPlays } = useGetInitiatedPlays(userId);
  
  // console.log('Open Play Invites:', openPlayInvites);
 
  // ADD THIS LINE - Get the refetch trigger from Redux
  const shouldRefetchInvitations = useSelector(
    (state: RootState) => state.refetch.shouldRefetchInvitations
  );

  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'INCOMING' | 'OUTGOING' | 'OPENPLAY'>(
    'INCOMING'
  );
  const [selectedInvite, setSelectedInvite] = useState<any>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedAction, setSelectedAction] = useState<
    'accept' | 'reject' | null
  >(null);

 
  const [playerCounts, setPlayerCounts] = useState<{ [key: string]: { accepted: number; total: number } }>({});
  const [playerDetailsVisible, setPlayerDetailsVisible] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]);

  const groupedOutgoing = groupInviteeByRequestId(
    outgoingInvitesRaw?.filter((invite) => invite.status !== 'WITHDRAWN') || []
  );
  const outgoingInvites = Object.values(groupedOutgoing);
  // console.log('Outgoing Invites:', outgoingInvites);
  const pendingOutCount = outgoingInvites.length;
  const playCount = (openPlayInvites?.length || 0)+ (initiatedPlays?.length || 0);

  const allInvites = invites ?? [];
  // console.log('All Invites:', allInvites);
  const playCalendarData = [
  ...(allInvites || []).map(invite => ({
    ...invite,
    type: 'incoming' as const,
  })),
  ...outgoingInvites.map(invite => ({
    ...invite,
    type: 'outgoing' as const,
  })),
    ...(openPlayInvites || []).map(play => {
    const startDate = new Date(
      play.startTime[0],
      play.startTime[1] - 1,
      play.startTime[2],
      play.startTime[3] || 0,
      play.startTime[4] || 0
    );
    return {
      type: 'openplay' as const,
      playTime: play.startTime,
      placeToPlay: play.allCourts?.Name || 'Unknown Court',
      dateTimeMs: startDate.getTime(),
      eventName: play.eventName?.replace(/_/g, ' ') || 'Unknown Play',
      isWaitlisted: play.waitlistedPlayers?.includes(userId),
      accepted: play.registeredPlayers?.length ?? 0,
      playersNeeded: play.maxPlayers ?? 1,
      id: play.id,
    };
  }),
];
  useEffect(() => {
    if (isFocused) {
      refetchOpenPlay(); 
    }
  }, [isFocused]);
const getInviteTimestamp = (invite) => {
  if (invite.dateTimeMs) {
    return Number(invite.dateTimeMs);
  }
  if (Array.isArray(invite.playTime)) {
    
    const [year, month, day, hour = 0, minute = 0] = invite.playTime;
    return new Date(year, month - 1, day, hour, minute).getTime();
  }
  return 0;
};


  useEffect(() => {
    const loadUser = async () => {
      const token = await getToken();
      if (token) await fetchUser();
    };
    loadUser();
  }, []);

  // ADD THIS useEffect - This handles the refetch when triggered from FindPlayerLayout
  useEffect(() => {
    if (shouldRefetchInvitations) {
      refetchOutgoing();
      dispatch(resetInvitationsRefetch());
    }
  }, [shouldRefetchInvitations, refetchOutgoing, dispatch]);

  useEffect(() => {
    const fetchCounts = async () => {
      const newCounts: { [key: string]: { accepted: number; total: number } } =
        {};
      for (const invite of allInvites) {
        try {
          const token = await getToken();
          const res = await axios.get(
            `${API_URL}/api/player-tracker/tracker/request`,
            {
              params: { requestId: invite.requestId },
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const total = res.data[0]?.playersNeeded+1|| 1;
          const accepted = res.data.filter(
            (p: any) => p.status === 'ACCEPTED'
          ).length + 1;

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
        selectedAction === 'accept'
          ? selectedInvite.acceptUrl
          : selectedInvite.declineUrl;
      const url = `${baseUrl}&comments=${encodeURIComponent(comment)}`;
      const response = await fetch(url);
      if (response.status === 200) {
        Alert.alert('Success', `Invitation ${selectedAction}ed`);
        refetch();
      } else {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        Alert.alert(
          'Error',
          `Failed to ${selectedAction} invitation. You may have another event at the same time.`
        );
      }
    } catch (e) {
      Alert.alert(
        'Error',
        `Something went wrong while trying to ${selectedAction}`
      );
    } finally {
      setLoadingId(null);
      setDialogVisible(false);
    }
  };

  const handleViewPlayers = async (requestId: string) => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API_URL}/api/player-tracker/tracker/request`, {
        params: { requestId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedPlayers(res.data);
      //  console.log('Selected Players:', res.data);
      setPlayerDetailsVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch player details');
    }
  };

  return (
    <PaperProvider>
      <LinearGradient colors={['#E0F7FA', '#FFFFFF']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.inviteWrapper}>
            <View style={styles.tabRow}>
              <ScrollView   horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipGroup}>
                <Text
                  style={[
                    styles.chip,
                    activeTab === 'INCOMING'
                      ? styles.chipActive
                      : styles.chipInactive,
                  ]}
                  onPress={() => setActiveTab('INCOMING')}
                >
                  Incoming Request ({allInvites.length})
                </Text>
                <Text
                  style={[
                    styles.chip,
                    activeTab === 'OUTGOING'
                      ? styles.chipActive
                      : styles.chipInactive,
                  ]}
                  onPress={() => setActiveTab('OUTGOING')}
                >
                  Sent Request ({pendingOutCount})
                </Text>
                <Text
                  style={[
                    styles.chip,
                    activeTab === 'OPENPLAY'
                      ? styles.chipActive
                      : styles.chipInactive,
                  ]}
                  onPress={() => setActiveTab('OPENPLAY')}
                >
                  Open Play ({playCount})
                </Text>
              </ScrollView>
              {(activeTab === 'INCOMING' && allInvites.length > 0) ||
              (activeTab === 'OUTGOING' && outgoingInvites.length > 0) ||
              (activeTab === 'OPENPLAY' && playCount > 0) ? (
                <TouchableOpacity
                  onPress={() => {
                      if (activeTab === 'INCOMING') {
                        router.replace('/(authenticated)/player-invitations?type=incoming');
                      } else if (activeTab === 'OUTGOING') {
                        router.replace('/(authenticated)/player-invitations?type=outgoing');
                      } else if (activeTab === 'OPENPLAY') {
                        router.replace('/(authenticated)/open-play-viewall');
                      }
                    }}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <LinearGradient
              colors={['#E0F7FA', '#FFFFFF']}
              style={styles.inviteScrollContainer}
            >
              <ScrollView
                nestedScrollEnabled
                contentContainerStyle={styles.inviteListContent}
              >
                {activeTab === 'INCOMING' ? (
                  allInvites.length === 0 ? (
                    <Text style={styles.noInvitesText}>
                      No incoming invitations
                    </Text>
                  ) : (
                   [...allInvites]
                    .filter(invite => getInviteTimestamp(invite) >= Date.now())
                    .sort((a, b) => getInviteTimestamp(a) - getInviteTimestamp(b))
                    .map((invite) => (
                      <InvitationCard
                        key={invite.id}
                        invite={invite}
                        onAccept={() => showCommentDialog(invite, 'accept')}
                        onReject={() => showCommentDialog(invite, 'reject')}
                        loading={loadingId === invite.id}
                        totalPlayers={playerCounts[invite.requestId]?.total ?? 1}
                        acceptedPlayers={playerCounts[invite.requestId]?.accepted ?? 0}
                        onViewPlayers={handleViewPlayers}
                      />
                    ))
                  )
                ) : activeTab === 'OUTGOING' ? (
                  outgoingInvites.length === 0 ? (
                    <Text style={styles.noInvitesText}>No sent invitations</Text>
                  ) : (
                    [...outgoingInvites]
                      .filter(invite => Number(invite.dateTimeMs) >= Date.now())
                      .sort((a, b) => Number(a.dateTimeMs) - Number(b.dateTimeMs))
                      .map((invite) => (
                        <OutgoingInviteCardItem
                          key={invite.requestId}
                          invite={invite}
                          onViewPlayers={handleViewPlayers}
                        />
                      ))
                    )
                ) : (
                  <OpenPlayCard
                    data={
                      (openPlayInvites || [])
                        .map(play => {
                          const startDate = new Date(
                            play.startTime[0],
                            play.startTime[1] - 1,
                            play.startTime[2],
                            play.startTime[3] || 0,
                            play.startTime[4] || 0
                          );
                          return {
                            ...play,
                            dateTimeMs: startDate.getTime(),
                            placeToPlay: play.allCourts?.Name || 'Unknown Court',
                            eventName: play.eventName?.replace(/_/g, ' ') || 'Unknown Play',
                            accepted: play.registeredPlayers?.length ?? 0,
                            playersNeeded: play.maxPlayers ?? 1,
                            isWaitlisted: play.waitlistedPlayers?.includes(userId),
                          };
                        })
                        .filter(play => play.dateTimeMs >= Date.now())
                        .sort((a, b) => Number(a.dateTimeMs) - Number(b.dateTimeMs)
                      )}
                    refetch={refetch}
                  />
                )}
              </ScrollView>
            </LinearGradient>
          </View>
        
          <FindplayerCard />

          <View style={styles.playCalendarHeaderRow}>
          <Text style={styles.playCalendarHeader}>Play Calendar</Text>
          <TouchableOpacity onPress={() => router.push('/(authenticated)/play-calendar')}>
            <Text style={styles.viewAllText}>Play Calendar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.calendarContainer}>
          {playCalendarData.length === 0 ? (
            <Text style={styles.noInvitesText}>No upcoming events</Text>
          ) : (
            <ScrollView
          nestedScrollEnabled
          contentContainerStyle={styles.calendarContent}
          >
              <PlayCalendarCard invites={playCalendarData} />
              </ScrollView>

            )}
          </View>


          <Portal>
            <Dialog
              visible={dialogVisible}
              onDismiss={() => setDialogVisible(false)}
            >
              <Dialog.Title>Add a message</Dialog.Title>
              <Dialog.Content>
                <TextInput
                  label='Comment (optional)'
                  value={comment}
                  onChangeText={setComment}
                  mode='outlined'
                />
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
                <Button onPress={handleDialogSubmit}>Submit</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>

          <Portal>
            <Modal
              visible={playerDetailsVisible}
              onDismiss={() => setPlayerDetailsVisible(false)}
              contentContainerStyle={styles.bottomModal}
            >
              <ScrollView>
                <ScrollView contentContainerStyle={styles.dialogContent}>
                  <PlayerDetailsModal players={selectedPlayers} />
                </ScrollView>
              </ScrollView>
            </Modal>
          </Portal>

          <Text style={styles.playersNearBy}>Players Nearby</Text>
          <Text style={styles.playersNearByDesc}>See users playing near by</Text>
          {/* <PlayersNearbyMap /> */}

          <NewMessages userId={user?.userId} />

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
    // flexShrink: 1,
    // maxWidth: '80%',
    // overflow: 'hidden',
    gap: 4,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 1,
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
bottomModal: {
  position: 'absolute',
  bottom: 0,
  width: '100%',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  backgroundColor: 'white',
  padding: 20,
  elevation: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.2,
  shadowRadius: 5,
  // height: '50%',
  // marginTop:400,
  maxHeight: '90%',
  marginTop: 'auto',
  alignSelf: 'stretch',
},
dialogContent: {
  paddingBottom: 20,
},
  playersNearBy: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
  },
  playersNearByDesc: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 20,
  },
  playCalendarHeader: {
  fontSize: 18,
  fontWeight: '700',
  marginBottom: 12,
},
calendarContainer: {
  borderRadius: 16,
  padding: 5,
  maxHeight: 240,
  marginBottom: 20,
  overflow: 'hidden',
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 4,
  backgroundColor: '#fff',
},
playCalendarHeaderRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
},



calendarScroll: {
  borderRadius: 12,
},

calendarContent: {
  gap: 10,
  paddingBottom: 10,
},


});
