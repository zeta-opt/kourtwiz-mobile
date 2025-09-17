import UserAvatar from '@/assets/UserAvatar';
import { GetCommentPlayerFinder } from '@/components/find-players/comment-layout/GetCommentPlayerFinder';
import { PostCommentPlayerFinder } from '@/components/find-players/comment-layout/PostCommentPlayerFinder';
import { useGetGroupById } from '@/hooks/apis/groups/useGetGroupById';
import { useGetPlaySessionById } from '@/hooks/apis/join-play/useGetPlaySessionById';
import { useGetPlayerFinderRequest } from '@/hooks/apis/player-finder/useGetPlayerFinderRequest';
import { RootState } from '@/store';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

export default function ChatSummaryPage() {
  const {
    requestId: reqId,
    id: grpId,
    sessionId: sessId,
    directUserId,
    directUserName,
    initialMessage,
  } = useLocalSearchParams<{
    requestId?: string;
    id?: string;
    sessionId?: string;
    directUserId?: string;
    directUserName?: string;
    initialMessage?: string;
  }>();

  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId ?? '';

  const isGroupChat = Boolean(grpId);
  const isSessionChat = Boolean(sessId);
  const isDirectChat = Boolean(directUserId);

  const {
    data: pfData,
    loading: pfLoading,
    error: pfError,
  } = useGetPlayerFinderRequest(
    !isGroupChat && !isSessionChat ? reqId : undefined
  );

  const {
    getGroup,
    status: groupStatus,
    error: groupError,
    data: groupData,
  } = useGetGroupById();

  useEffect(() => {
    if (isGroupChat && grpId) {
      getGroup({ groupId: grpId });
    }
  }, [isGroupChat, grpId]);

  const {
    data: sessionData,
    status: sessionStatus,
    error: sessionError,
  } = useGetPlaySessionById(isSessionChat ? (sessId as string) : undefined);

  const loading = isGroupChat
    ? groupStatus === 'loading'
    : isSessionChat
    ? sessionStatus === 'loading'
    : pfLoading;

  const error = isGroupChat
    ? groupError
    : isSessionChat
    ? sessionError
    : pfError;

  const title = isGroupChat
    ? groupData?.name
    : isSessionChat
    ? sessionData?.session?.eventName || 'Open Play'
    : isDirectChat
    ? directUserName
    : pfData && pfData.length > 0
    ? pfData[0].placeToPlay
    : 'Request';

  const commentId = isGroupChat
    ? grpId
    : isSessionChat
    ? sessId
    : isDirectChat
    ? reqId
    : pfData && pfData.length > 0
    ? pfData?.[0]?.requestId
    : undefined;

  const [refetchComments, setRefetchComments] = useState<() => void>(
    () => () => {}
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' color='#3F7CFF' />
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
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={50}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (isGroupChat) {
              router.replace('/groups');
            } else if (isSessionChat) {
              router.push({ pathname: '/(authenticated)/home' });
            } else {
              router.replace('/home');
            }
          }}
        >
          <MaterialIcons name='arrow-back-ios' size={24} color='#fff' />
        </TouchableOpacity>

        {isGroupChat ? (
          <TouchableOpacity onPress={() => router.push(`/group-info/${grpId}`)}>
            <Text style={styles.headerTitle}>{title || 'Group'}</Text>
          </TouchableOpacity>
        ) : isDirectChat ? (
          <Text style={styles.headerTitle}>{title || 'Chat'}</Text>
        ) : (
          <Text style={styles.headerTitle}>{title || 'Request'}</Text>
        )}

        <TouchableOpacity
          onPress={() => router.push('/(authenticated)/profile')}
        >
          <UserAvatar size={36} />
        </TouchableOpacity>
      </View>

      {/* Chat Content */}
      <View style={styles.commentSection}>
        {initialMessage && (
          <View style={styles.originalMessageContainer}>
            <Text style={styles.originalMessageText}>{initialMessage}</Text>
          </View>
        )}

        <ScrollView
          style={styles.chatBox}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='on-drag'
        >
          <GetCommentPlayerFinder
            requestId={commentId}
            onRefetchAvailable={(ref) => setRefetchComments(() => ref)}
          />
        </ScrollView>

        {/* Input Container */}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#E8F6F8',
  },
  commentSection: {
    flex: 1,
    backgroundColor: '#E8F6F8',
  },
  header: {
    backgroundColor: '#007A7A',
    paddingTop: Platform.OS === 'ios' ? 48 : 36,
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
  commentInputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 6 : 4,
    backgroundColor: '#fff',
  },
  chatBox: {
    flex: 1,
    padding: 8,
    backgroundColor: '#E8F6F8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  originalMessageContainer: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    margin: 10,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  originalMessageText: {
    fontSize: 14,
    color: '#333',
  },
  errorText: {
    color: '#D8000C',
    fontSize: 16,
  },
});
