import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, View } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { useSelector } from 'react-redux';
import Constants from 'expo-constants';

import { RootState } from '@/store';
import useGetOpenPlaySessions from '@/hooks/apis/createPlay/useGetOpenPlaySessions';
import { useGetClubCourt } from '@/hooks/apis/courts/useGetClubCourts';
import { useCancelPlaySession } from '@/hooks/apis/createPlay/useCancelPlaySession';
import { getToken } from '@/shared/helpers/storeToken';

const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

const CreatePlayScreen = () => {
  const clubId = useSelector(
    (state: RootState) => state.auth.user?.userClubRole?.[0]?.clubId
  );

  const { data, status, refetch } = useGetOpenPlaySessions(clubId || '');
  const { data: courtList } = useGetClubCourt({ clubId: clubId! });
  const { cancelSession, status: cancelStatus, cancelledSessionId } = useCancelPlaySession();

  const [loadingPlayerFinder, setLoadingPlayerFinder] = useState<string | null>(null);
  const [loadingInvites, setLoadingInvites] = useState<string | null>(null);

  const getCourtName = (courtId: string) => {
    const court = courtList?.find((court) => String(court.id) === String(courtId));
    return court ? court.name : 'Unknown';
  };

  const parseStartTime = (startTime: number[]) => {
    return new Date(
      startTime[0],
      startTime[1] - 1,
      startTime[2],
      startTime[3],
      startTime[4]
    );
  };

  const handleUsePlayerFinder = async (sessionId: string) => {
    try {
      setLoadingPlayerFinder(sessionId);
      const token = await getToken();

      const response = await fetch(`${BASE_URL}/api/player-finder/invite/${sessionId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to initiate player finder');
      }
      Alert.alert('Success', 'Player finder initiated successfully');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoadingPlayerFinder(null);
    }
  };

  const handleTrackInvitedPlayers = async (sessionId: string) => {
    try {
      setLoadingInvites(sessionId);
      const token = await getToken();

      const response = await fetch(`${BASE_URL}/api/player-finder/invited-users/${sessionId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invited players');
      }

      const invites = await response.json();

      Alert.alert(
        'Invited Players',
        invites.length > 0
          ? invites.map((inv: any) => `${inv.name} (${inv.email})`).join('\n')
          : 'No players invited yet.'
      );
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoadingInvites(null);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    Alert.alert(
      'Confirm Cancel',
      'Are you sure you want to cancel this session?',
      [
        { text: 'No' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await cancelSession(sessionId);
              Alert.alert('Success', 'Session cancelled');
              refetch(); // Refresh the session list
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  if (status === 'loading') {
    return <ActivityIndicator style={{ marginTop: 50 }} />;
  }

  if (status === 'error') {
    return <Text style={{ margin: 20, color: 'red' }}>Failed to load sessions.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {data?.map((session) => {
        const filledSlots = session.registeredPlayers?.length ?? 0;
        const date = parseStartTime(session.startTime);

        return (
          <Card key={session.id} style={styles.card}>
            <Card.Content>
              <Text>Date: {date.toLocaleDateString()}</Text>
              <Text>
                Time: {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text>Play Type: {session.playTypeName}</Text>
              <Text>Skill Level: {session.skillLevel}</Text>
              <Text>Duration(min): {session.durationMinutes}</Text>
              <Text>Price: ${session.priceForPlay}</Text>
              <Text>Court: {getCourtName(session.courtId)}</Text>
              <Text>
                Slots: {filledSlots}/{session.maxPlayers}
              </Text>
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              <View style={styles.firstRow}>
                <Button
                  mode="contained"
                  onPress={() => handleUsePlayerFinder(session.id)}
                  loading={loadingPlayerFinder === session.id}
                  disabled={filledSlots === session.maxPlayers || loadingPlayerFinder === session.id}
                  style={styles.actionButton}
                >
                  Use Player Finder
                </Button>
                <Button
                  mode="contained"
                  onPress={() => handleTrackInvitedPlayers(session.id)}
                  loading={loadingInvites === session.id}
                  disabled={loadingInvites === session.id}
                  style={styles.actionButton}
                >
                  Track Invited Players
                </Button>
              </View>
              <View style={styles.secondRow}>
                <Button
                  mode="outlined"
                  onPress={() => handleCancelSession(session.id)}
                  loading={cancelledSessionId === session.id && cancelStatus === 'loading'}
                  disabled={cancelledSessionId === session.id && cancelStatus === 'loading'}
                  style={styles.cancelButton}
                >
                  Cancel Session
                </Button>
              </View>
            </Card.Actions>
          </Card>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  card: {
    marginBottom: 15,
  },
  cardActions: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  firstRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  secondRow: {
    width: '100%',
  },
  actionButton: {
    marginRight: 10,
    flex: 1,
  },
  cancelButton: {
    width: '100%',
  },
});

export default CreatePlayScreen;
