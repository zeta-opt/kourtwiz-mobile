import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, Divider, IconButton, Button } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetPlayerFinderRequest, PlayerFinderRequest } from '@/hooks/apis/player-finder/useGetPlayerFinderRequest';
import { GetCommentPlayerFinder } from '@/components/find-players/comment-layout/GetCommentPlayerFinder';
import { PostCommentPlayerFinder } from '@/components/find-players/comment-layout/PostCommentPlayerFinder';
import { MaterialIcons } from '@expo/vector-icons';
import UserAvatar from '@/assets/UserAvatar';

const statusColorMap: Record<string, string> = {
  ACCEPTED: 'green',
  PENDING: 'orange',
  DECLINED: 'red',
};

const statusIconMap: Record<string, string> = {
  ACCEPTED: 'check-circle',
  PENDING: 'clock',
  DECLINED: 'close-circle',
};

export default function InviteSummaryPage() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId ?? '';
  const { data, loading, error } = useGetPlayerFinderRequest(requestId);
  const [refetchComments, setRefetchComments] = useState<() => void>(() => () => {});

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3F7CFF" />
      </View>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load invite details</Text>
      </View>
    );
  }

  const mainRequest = data[0];
  const acceptedCount = data.filter((d) => d.status === 'ACCEPTED').length;
  const totalNeeded = mainRequest.playersNeeded || 0;

  const formatTimeArray = (timeArr: number[]) => {
    if (!Array.isArray(timeArr) || timeArr.length < 5) return 'Invalid Time';
    const [year, month, day, hour, minute] = timeArr;
    const date = new Date(year, month - 1, day, hour, minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateArray = (timeArr: number[]) => {
    if (!Array.isArray(timeArr) || timeArr.length < 5) return 'Invalid Date';
    const [year, month, day] = timeArr;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.page}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{mainRequest.placeToPlay || 'Request'}</Text>
       <TouchableOpacity onPress={() => router.push('/(authenticated)/profile')}>
          <UserAvatar size={36} />
        </TouchableOpacity>
      </View>

      
        {/* <Text>
          {formatDateArray(mainRequest.playTime)}, {formatTimeArray(mainRequest.playTime)} - {formatTimeArray(mainRequest.playEndTime)}
        </Text>
        <Text>Skill Rating: {mainRequest.skillRating}</Text>
        <Text style={{ marginTop: 4 }}>Accepted: {acceptedCount}/{totalNeeded}</Text>
        <Divider style={{ marginVertical: 10 }} />
        <Text style={styles.sectionLabel}>Players</Text> */}
        {/* <View style={styles.playersContainer}>
          {data.map((player: PlayerFinderRequest) => {
            const status = player.status?.toUpperCase() || 'PENDING';
            return (
              <View key={player.userId} style={styles.row}>
                <Text style={[styles.nameText, { color: statusColorMap[status] || 'gray' }]}>{player.name}</Text>
                <View style={styles.roleInfo}>
                  <IconButton
                    icon={statusIconMap[status] || 'help-circle'}
                    iconColor={statusColorMap[status] || 'gray'}
                    size={18}
                  />
                  <Text style={{ color: statusColorMap[status] || 'gray' }}>{status}</Text>
                </View>
              </View>
            );
          })}
        </View> */}

        {/* <Divider style={{ marginVertical: 10 }} /> */}
        {/* <Text style={styles.subHeading}>Comments</Text> */}
        <View style={styles.commentSection}>
        <ScrollView style={styles.chatBox} keyboardShouldPersistTaps="handled">
          <GetCommentPlayerFinder
            requestId={mainRequest.requestId}
            onRefetchAvailable={(ref) => setRefetchComments(() => ref)}
          />
        </ScrollView>

        {userId && mainRequest.requestId && (
          <View style={styles.commentInputContainer}>
            {/* <Divider style={{ marginVertical: 10 }} /> */}
            <PostCommentPlayerFinder
              requestId={mainRequest.requestId}
              userId={userId}
              onSuccess={() => refetchComments()}
            />
          </View>
        )}
        </View>

        {/* <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
          Go Back
        </Button> */}
      
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#E8F6F8',
  },
  commentSection: {
   flex: 1,
  justifyContent: 'flex-end',
  backgroundColor: '#E8F6F8',
},
  header: {
    backgroundColor: '#007A7A',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  profilePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ccc',
  },
  commentInputContainer: {
  borderTopWidth: 1,
  borderTopColor: '#ccc',
  paddingHorizontal: 10,
  paddingVertical: 6,
  backgroundColor: '#fff',
},
  content: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'gray',
    marginBottom: 6,
    marginTop: 8,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '500',
    color: 'gray',
    marginBottom: 4,
  },
  chatBox: {
   flex: 1,
  padding: 8,
  backgroundColor: '#E8F6F8',
  borderRadius: 12,
  },
  backButton: {
    marginTop: 10,
    borderRadius: 20,
    backgroundColor: '#6A1B9A',
  },
  errorText: {
    color: '#D8000C',
    fontSize: 16,
  },
});
