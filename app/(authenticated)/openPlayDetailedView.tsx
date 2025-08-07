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
import { useGetPlays } from '@/hooks/apis/join-play/useGetPlays';
import { useGetUserDetails } from '@/hooks/apis/player-finder/useGetUserDetails';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useMutateJoinPlay } from '@/hooks/apis/join-play/useMutateJoinPlay';
import { useWithdrawFromPlay } from '@/hooks/apis/join-play/useWithdrawFromPlay';
import { useWithdrawFromWaitlist } from '@/hooks/apis/join-play/useWithdrawFromWaitlist';
import Toast from 'react-native-toast-message';
import UserAvatar from '@/assets/UserAvatar';

export default function OpenPlayDetailedView() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { user } = useSelector((state: RootState) => state.auth);
  const clubId = user?.currentActiveClubId || 'GLOBAL';

  const { data: playsData, status, refetch } = useGetPlays(clubId, user?.userId);
  const selectedPlay = playsData?.find((play: any) => play.id === sessionId);
  console.log('Selected Play:', selectedPlay);

  const requestorId = selectedPlay?.requestorId;
  const { data: requestorData } = useGetUserDetails({
    userId: requestorId,
    enabled: !!requestorId,
  });

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

  if (!selectedPlay) {
    return <Text style={styles.errorText}>Play session not found</Text>;
  }

  const startDate = new Date(
    selectedPlay.startTime[0],
    selectedPlay.startTime[1] - 1,
    selectedPlay.startTime[2],
    selectedPlay.startTime[3] || 0,
    selectedPlay.startTime[4] || 0
  );
  const endDate = new Date(startDate.getTime() + selectedPlay.durationMinutes * 60000);

  const registeredPlayerIds = selectedPlay.registeredPlayers || [];
  const waitlistedPlayerIds = selectedPlay.waitlistedPlayers || [];

  const userId = user?.userId;
  const isRegistered = registeredPlayerIds.includes(userId);
  const isWaitlisted = waitlistedPlayerIds.includes(userId);
  const isFull = (registeredPlayerIds.length - 1) >= selectedPlay.maxPlayers;

  const acceptedCount = registeredPlayerIds.length - 1;
  const maxSlots = selectedPlay.maxPlayers;
  const courtName = selectedPlay.allCourts?.Name || 'Not specified';
  const eventName = selectedPlay.eventName || 'Open Play';
  const requestorName = requestorData?.name || 'Someone';

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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Open Play</Text>
          <TouchableOpacity onPress={() => router.push('/(authenticated)/profile')}>
            <UserAvatar size={36} />
          </TouchableOpacity>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>About Event</Text>
          <Text style={styles.inviteText}>{requestorName} Invited To Play</Text>
          <Text style={styles.inviteText}>Event Name : {eventName}</Text>
        </View>

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
              <Text style={styles.infoText}>${selectedPlay.priceForPlay.toFixed(2)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>Description:</Text>
          <Text style={styles.descriptionText}>
            {selectedPlay.description?.trim()
              ? selectedPlay.description
              : 'No description for this event'}
          </Text>
        </View>

      </ScrollView>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  aboutSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  inviteText: {
    fontSize: 16,
    color: '#444',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  column: {
    alignItems: 'center',
    flex: 1,
  },
  columnWide: {
    flex: 2,
    alignItems: 'center',
  },
  iconCircle: {
    backgroundColor: '#E6F7F7',
    padding: 10,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  infoText: {
    marginTop: 4,
    fontSize: 13,
    color: '#333',
  },
  infoText2: {
    marginTop: 4,
    fontSize: 11,
    color: '#333',
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    backgroundColor: '#2F7C83',
    width: '100%',
    // height: '100%',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  withdrawButton: {
    backgroundColor: '#D32F2F',
  },
  waitlistWithdrawButton: {
    backgroundColor: '#D32F2F',
  },
  joinWaitlistButton: {
    backgroundColor: '#F6C90E',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'red',
  },
  fixedBottom: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#F9F9F9',
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  descriptionCard: {
  padding: 4,
  marginHorizontal: 4,
  marginBottom: 20,
},

descriptionTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#000',
  marginBottom: 8,
},

descriptionText: {
  fontSize: 14,
  color: '#555',
  lineHeight: 20,
},

});
