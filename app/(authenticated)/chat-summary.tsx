import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetPlayerFinderRequest} from '@/hooks/apis/player-finder/useGetPlayerFinderRequest';
import { GetCommentPlayerFinder } from '@/components/find-players/comment-layout/GetCommentPlayerFinder';
import { PostCommentPlayerFinder } from '@/components/find-players/comment-layout/PostCommentPlayerFinder';
import { MaterialIcons } from '@expo/vector-icons';
import UserAvatar from '@/assets/UserAvatar';
import { useGetGroupById } from '@/hooks/apis/groups/useGetGroupById';

export default function ChatSummaryPage() {
const { requestId, id: groupId } = useLocalSearchParams<{ requestId?: string; id?: string }>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId ?? '';
  const isGroupChat = Boolean(groupId);

  const { data: pfData, loading: pfLoading, error: pfError } =
    useGetPlayerFinderRequest(!isGroupChat ? requestId : undefined);

  const {
    getGroup,
    status: groupStatus,
    error: groupError,
    data: groupData
  } = useGetGroupById();

  useEffect(() => {
    if (isGroupChat && groupId) {
      getGroup({ groupId });
    }
  }, [isGroupChat, groupId]);

  const loading = isGroupChat ? groupStatus === 'loading' : pfLoading;
  const error = isGroupChat ? groupError : pfError;
  const title = isGroupChat ? groupData?.name : pfData?.[0]?.placeToPlay;
  const commentId = isGroupChat ? groupId : pfData?.[0]?.requestId;
  

  const [refetchComments, setRefetchComments] = useState<() => void>(() => () => {});

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3F7CFF" />
      </View>
    );
  }

  if (error || !commentId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load chat details</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (isGroupChat) {
              router.replace('/groups');
            } else {
              router.replace('/home');
            }
          }}
        >
      <MaterialIcons name="arrow-back-ios" size={24} color="#fff" />
      </TouchableOpacity>
            {isGroupChat ? (
              <TouchableOpacity onPress={() => router.push(`/group-info/${groupId}`)}>
                <Text style={styles.headerTitle}>{title || 'Request'}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.headerTitle}>{title || 'Request'}</Text>
            )}
        <TouchableOpacity onPress={() => router.push('/(authenticated)/profile')}>
            <UserAvatar size={36} />
          </TouchableOpacity>
        </View>
        <View style={styles.commentSection}>
        <ScrollView style={styles.chatBox} keyboardShouldPersistTaps="handled">
          <GetCommentPlayerFinder
            requestId={commentId}
            onRefetchAvailable={(ref) => setRefetchComments(() => ref)}
          />
        </ScrollView>

        {userId && commentId && (
          <View style={styles.commentInputContainer}>
            <PostCommentPlayerFinder
              requestId={commentId}
              userId={userId}
              onSuccess={() => refetchComments()}
            />
          </View>
        )}
        </View>
      
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
