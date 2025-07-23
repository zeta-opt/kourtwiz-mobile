import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useGetPlayerFinderRequest } from '@/hooks/apis/player-finder/useGetPlayerFinderRequest';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import UserAvatar from '@/assets/UserAvatar';

function arrayToDate(arr: number[]): Date {
  if (!arr || arr.length < 6) return new Date(); // fallback
  return new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]); // JS months are 0-indexed
}

export default function MyRequestsDetailedView() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const { data, loading, error } = useGetPlayerFinderRequest(requestId);

  if (loading) return <ActivityIndicator size="large" style={styles.loader} />;
  if (error || !data) return <Text style={styles.error}>Error loading data</Text>;

  const playTime = arrayToDate(data[0]?.playTime);
  const dateString = playTime.toLocaleDateString();
  const timeString = playTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const accepted = data.filter((p: any) => p.status === 'ACCEPTED').length;
  const total = data[0]?.playersNeeded || 0;
  const location = data[0]?.placeToPlay || 'Not specified';
  const requesterName = data[0]?.inviteeName || 'Someone';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Incoming Request</Text>
        <TouchableOpacity onPress={() => router.push('/(authenticated)/profile')}>
          <UserAvatar size={36} />
        </TouchableOpacity>
      </View>

      {/* Subheading */}
      <Text style={styles.subheading}>{requesterName} Invited To Play</Text>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.column}>
            <View style={styles.infoCard}>
              <FontAwesome5 name="calendar-alt" size={20} color="#2CA6A4" />
            </View>
            <Text style={styles.infoText}>{dateString}</Text>
          </View>
          <View style={styles.column}>
            <View style={styles.infoCard}>
              <FontAwesome5 name="clock" size={20} color="#2CA6A4" />
            </View>
            <Text style={styles.infoText}>{timeString}</Text>
          </View>
          <View style={styles.column}>
            <View style={styles.infoCard}>
              <FontAwesome5 name="users" size={20} color="#2CA6A4" />
            </View>
            <Text style={styles.infoText}>{accepted}/{total} Accepted</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <View style={styles.locationIconWrapper}>
            <FontAwesome5 name="map-marker-alt" size={16} color="#2CA6A4" />
          </View>
          <Text style={styles.locationText}>Event Place: {location}</Text>
        </View>
      </View>

      {/* Chat Preview + Join Button */}
      <View style={styles.chatPreviewContainer}>
        {/* <Text style={styles.chatPreviewTitle}>Recent Messages</Text> */}
        <Text style={styles.chatPreviewText}>Chat with players here...</Text>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() =>
            router.push({ pathname: '/(authenticated)/incoming-summarty', params: { requestId } })
          }
        >
          <Text style={styles.joinButtonText}>Join Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
  },
  subheading: {
    textAlign: 'left',
    fontSize: 16,
    color: '#000000',
    marginBottom: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  column: {
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    marginTop: 4,
    fontSize: 13,
    color: '#333',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 28,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#444',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  infoCard: {
    backgroundColor: '#E6F7F7',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 30,
    alignItems: 'center',
    width: '40%',
    alignSelf: 'center',
  },
  locationIconWrapper: {
    backgroundColor: '#E6F7F7',
    padding: 8,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
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
  chatPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#222',
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
