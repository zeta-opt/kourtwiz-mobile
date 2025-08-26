import { useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetPlaySessionById } from '@/hooks/apis/join-play/useGetPlaySessionById';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useMutateJoinPlay } from '@/hooks/apis/join-play/useMutateJoinPlay';
import { useWithdrawFromPlay } from '@/hooks/apis/join-play/useWithdrawFromPlay';
import { useWithdrawFromWaitlist } from '@/hooks/apis/join-play/useWithdrawFromWaitlist';
import Toast from 'react-native-toast-message';
import UserAvatar from '@/assets/UserAvatar';

export default function OpenPlayDetailedView() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId;

  // Fetch single play session details
  const { data, status, error, refetch } = useGetPlaySessionById(sessionId);
  const selectedPlay = data?.session || null;
  console.log('Selected Play:', selectedPlay);
  console.log('Data:', data);

  const { joinPlaySession } = useMutateJoinPlay();
  const { withdraw } = useWithdrawFromPlay();
  const { withdrawFromWaitlist } = useWithdrawFromWaitlist();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'error') {
      refetch();
    }
  }, [status, refetch]);

  if (status === 'loading') {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }
  if (status === 'error') {
    return <Text style={styles.errorText}>{error || 'Something went wrong'}</Text>;
  }
  if (!selectedPlay) {
    return <Text style={styles.errorText}>Play session not found</Text>;
  }

  // Dates
  const startDate = new Date(
    selectedPlay.startTime?.[0] || 1970,
    (selectedPlay.startTime?.[1] || 1) - 1,
    selectedPlay.startTime?.[2] || 1,
    selectedPlay.startTime?.[3] || 0,
    selectedPlay.startTime?.[4] || 0
  );
  const endDate = new Date(startDate.getTime() + (selectedPlay.durationMinutes || 0) * 60000);

  // Players info
  const registeredPlayerIds = selectedPlay.registeredPlayers || [];
  const waitlistedPlayerIds = selectedPlay.waitlistedPlayers || [];
  const isRegistered = registeredPlayerIds.includes(userId);
  const isWaitlisted = waitlistedPlayerIds.includes(userId);
  const isFull = selectedPlay.sessionFull ?? false;

  const acceptedCount = registeredPlayerIds.length;
  const maxSlots = (selectedPlay.maxPlayers ?? 0) + 1;
  const courtName = selectedPlay.allCourts?.Name || 'Not specified';
  const eventName = selectedPlay.eventName || 'Open Play';
  const requestorName = selectedPlay.requestorName || 'Someone';

  const handleJoinPlay = async () => {
    setLoading(true);
    try {
      if (isWaitlisted) {
        await withdrawFromWaitlist({ sessionId, userId });
        Toast.show({ type: 'success', text1: 'Withdrawn from waitlist', topOffset: 100 });
      } else if (isRegistered) {
        await withdraw({ sessionId, userId });
        Toast.show({ type: 'success', text1: 'Withdrawn from play', topOffset: 100 });
      } else {
        await joinPlaySession({
          userId,
          sessionId,
          callbacks: {
            onSuccess: () => {
              Toast.show({
                type: 'success',
                text1: isFull ? 'Joined waitlist' : 'Joined play',
                topOffset: 100,
              });
            },
            onError: (error) => {
              Toast.show({
                type: 'error',
                text1: 'Failed to join',
                text2: error.message,
                topOffset: 100,
              });
            },
          },
        });
      }
      refetch();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Action Failed',
        text2: err.message || 'Something went wrong',
        topOffset: 100,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(authenticated)/home')}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Open Play</Text>
          <TouchableOpacity onPress={() => router.push('/(authenticated)/profile')}>
            <UserAvatar size={36} />
          </TouchableOpacity>
        </View>

        {/* About Event */}
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>About Event</Text>
          <Text style={styles.inviteText}>{requestorName} Invited To Play</Text>
          <Text style={styles.inviteText}>Event Name : {eventName}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.row}>
            <View style={styles.column}>
              <View style={styles.iconCircle}>
                <FontAwesome5 name="calendar-alt" size={20} color="#2CA6A4" />
              </View>
              <Text style={styles.infoText}>{startDate.toLocaleDateString()}</Text>
            </View>
            <View style={styles.column}>
              <View style={styles.iconCircle}>
                <FontAwesome5 name="clock" size={20} color="#2CA6A4" />
              </View>
              <Text style={styles.infoText2}>
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={styles.column}>
              <View style={styles.iconCircle}>
                <FontAwesome5 name="users" size={20} color="#2CA6A4" />
              </View>
              <Text style={styles.infoText}>
                {acceptedCount}/{maxSlots} Accepted
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.columnWide}>
              <View style={styles.iconCircle}>
                <FontAwesome5 name="map-marker-alt" size={16} color="#2CA6A4" />
              </View>
              <Text style={styles.infoText}>Event Place: {courtName}</Text>
            </View>
            <View style={styles.column}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="wallet" size={16} color="#2F7C83" />
              </View>
              <Text style={styles.infoText}>
                ${selectedPlay.priceForPlay?.toFixed?.(2) ?? '0.00'}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>Description:</Text>
          <Text style={styles.descriptionText}>
            {selectedPlay.description?.trim()
              ? selectedPlay.description
              : 'No description for this event'}
          </Text>
        </View>

        {/* Player Lists */}
        <View style={styles.playerListSection}>
          <Text style={styles.playersListTitle}>Registered Players:</Text>
          {data?.registeredPlayersNames && data.registeredPlayersNames.length > 0 ? (
            data.registeredPlayersNames.map((name:string, idx:number) => (
              <Text style={styles.playerName} key={idx}>• {name}</Text>
            ))
          ) : (
            <Text style={styles.playerNameDimmed}>No players registered yet.</Text>
          )}

          <Text style={[styles.playersListTitle, { marginTop: 12 }]}>Waitlisted Players:</Text>
          {data?.waitlistedPlayersNames && data.waitlistedPlayersNames.length > 0 ? (
            data.waitlistedPlayersNames.map((name:string, idx:number) => (
              <Text style={styles.playerName} key={idx}>• {name}</Text>
            ))
          ) : (
            <Text style={styles.playerNameDimmed}>No one on waitlist.</Text>
          )}
        </View>
        <View style={styles.chatPreviewContainer}>
            <Text style={styles.chatPreviewText}>Chat with players here...</Text>
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => {
                if (isRegistered) {
                  router.push({ pathname: '/(authenticated)/chat-summary', params: { sessionId } });
                } else {
                  Toast.show({
                    type: 'info',
                    text1: 'Register required',
                    text2: 'Register for the event to chat with players',
                    topOffset: 100,
                  });
                }
              }}
            >
              <Text style={styles.joinButtonText}>
                {isRegistered ? 'Join Chat' : 'Register to Chat'}
              </Text>
            </TouchableOpacity>

          </View>
        
      </ScrollView>

      {/* Action Button */}
      <View style={styles.fixedBottom}>
        <TouchableOpacity
          disabled={loading}
          style={[
            styles.actionButton,
            isWaitlisted && styles.waitlistWithdrawButton,
            isRegistered && styles.withdrawButton,
            !isRegistered && isFull && !isWaitlisted && styles.joinWaitlistButton,
          ]}
          onPress={handleJoinPlay}
        >
          <Text style={styles.actionButtonText}>
            {loading
              ? 'Please wait...'
              : isWaitlisted
              ? 'Withdraw from Waitlist'
              : isRegistered
              ? 'Withdraw'
              : isFull
              ? 'Join Waitlist'
              : 'Register'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', paddingHorizontal: 16, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '600' },
  aboutSection: { marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 4 },
  inviteText: { fontSize: 16, color: '#444' },
  infoCard: {
    backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, shadowColor: '#000',
    shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
    elevation: 2, marginBottom: 16,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  column: { alignItems: 'center', flex: 1 },
  columnWide: { flex: 2, alignItems: 'center' },
  iconCircle: {
    backgroundColor: '#E6F7F7', padding: 10, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  infoText: { marginTop: 4, fontSize: 13, color: '#333' },
  infoText2: { marginTop: 4, fontSize: 11, color: '#333' },
  actionButton: {
    paddingVertical: 14, paddingHorizontal: 32, borderRadius: 10, backgroundColor: '#2F7C83',
    width: '100%', alignItems: 'center',
  },
  actionButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  withdrawButton: { backgroundColor: '#D32F2F' },
  waitlistWithdrawButton: { backgroundColor: '#D32F2F' },
  joinWaitlistButton: { backgroundColor: '#F6C90E' },
  loader: { flex: 1, justifyContent: 'center' },
  errorText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'red' },
  fixedBottom: {
    position: 'absolute', bottom: 20, left: 16, right: 16, backgroundColor: '#F9F9F9',
    paddingVertical: 10, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 4,
  },
  descriptionCard: { padding: 4, marginHorizontal: 4, marginBottom: 20 },
  descriptionTitle: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 8 },
  descriptionText: { fontSize: 14, color: '#555', lineHeight: 20 },

  // New styles for players list
  playerListSection: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    elevation: 1,
  },
  playersListTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#2F7C83',
    marginBottom: 3,
  },
  playerName: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  playerNameDimmed: {
    fontSize: 14,
    color: '#999',
    marginLeft: 10,
    fontStyle: 'italic',
  },
  chatPreviewContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  chatPreviewText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
    joinButton: {
    backgroundColor: '#007A7A',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
