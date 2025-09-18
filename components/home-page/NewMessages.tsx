import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { router } from 'expo-router';
import { useGetAllComments, Comment } from '@/hooks/apis/player-finder/useGetAllComments';
import * as Location from 'expo-location';

const convertDateArrayToDate = (arr: number[]) => {
  if (!Array.isArray(arr) || arr.length < 3) return new Date(NaN);
  const [year, month, day, hour = 0, minute = 0, second = 0] = arr;
  return new Date(year, month - 1, day, hour, minute, second);
};

const formatTime = (timestamp: number[] | string | null | undefined) => {
  if (!timestamp) return '--:--';

  let date: Date;

  if (Array.isArray(timestamp)) {
    if (timestamp.length < 3) return '--:--';
    date = convertDateArrayToDate(timestamp);
  } else if (typeof timestamp === 'string' && timestamp.trim()) {
    date = new Date(timestamp);
  } else {
    return '--:--';
  }

  if (isNaN(date.getTime())) return '--:--';

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function NewMessages() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch current location once
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        let loc = await Location.getCurrentPositionAsync({});
        setLat(loc.coords.latitude);
        setLng(loc.coords.longitude);
      } catch (err) {
        console.warn('Failed to get current location', err);
      }
    })();
  }, []);

  // For IWantToPlayEvent → useGetAllComments
  console.log("Fetching comments with payload:", {
    userId: user?.userId ?? '',
    lat: lat ?? 0,
    lng: lng ?? 0,
  });
  const {
    data: allMessages,
    status: allStatus,
  } = useGetAllComments({
    userId: user?.userId ?? '',
    lat: lat ?? 0,
    lng: lng ?? 0,
  });

  if (allStatus === 'loading') return <ActivityIndicator size="large" color="#0000ff" />;
  if (allStatus === 'error') return <Text>Error loading messages</Text>;

  const sortedMessages = allMessages
    ? [...allMessages]
        .filter((msg) => msg.commentText && msg.commentText.trim().length > 0)
        .sort((a, b) => {
          const dateA =
            Array.isArray(a.timestamp)
              ? convertDateArrayToDate(a.timestamp)
              : new Date(a.timestamp as any);

          const dateB =
            Array.isArray(b.timestamp)
              ? convertDateArrayToDate(b.timestamp)
              : new Date(b.timestamp as any);

          return dateB.getTime() - dateA.getTime();
        })
    : [];

  const previewMessages = sortedMessages.slice(0, 2);

  // Handle press → fetch comments differently per type
  const handleMessagePress = (msg: Comment) => {
    if (!msg) {
      alert('Chat details not available.');
      return;
    }

    switch (msg.eventType) {
      case 'IWantToPlayEvent':
        router.push({
          pathname: '/(authenticated)/chat-summary',
          params: {
            directUserId: msg.userId,
            directUserName: msg.userName,
            requestId: msg.requestId,
            initialMessage: msg.commentText,
            isIndividualMessage: 'false',
          },
        });
        break;

      case 'PlayerFinderEvent':
      case 'GroupEvent':
        if (!msg.requestId) {
          alert('Chat not available for this event.');
          return;
        }
        router.push({
          pathname: '/(authenticated)/chat-summary',
          params: { requestId: msg.requestId },
        });
        break;

      case 'CreateEvent':
        if (!msg.requestId) {
          alert('Chat not available for this session.');
          return;
        }
        router.push({
          pathname: '/(authenticated)/chat-summary',
          params: { sessionId: msg.requestId },
        });
        break;

      case 'Individual Message':
        if (!msg.requestId || !msg.userId || !msg.userName) {
          alert('Chat not available for this message.');
          return;
        }

        const params = {
          requestId: msg.requestId,
          directUserId: msg.receiverId,
          directUserName: msg.userName,
          initialMessage: msg.commentText,
          isIndividualMessage: 'true',
        };

        console.log("Navigating with Individual Message params:", params);

        router.push({
          pathname: '/(authenticated)/chat-summary',
          params,
        });
        break;
    }
  };

  const renderMessageRow = (msg: Comment, isModal = false) => (
    <View
      key={msg.id}
      style={isModal ? styles.modalMessageBlock : styles.messageBlock}
    >
      <View style={styles.userRow}>
        <MaterialIcons name="person" size={16} color="#444" />
        <View style={styles.modalMessageRow}>
          <Text style={styles.username}>{msg.userName}</Text>
          <Text style={styles.timeText}>{formatTime(msg.timestamp)}</Text>
        </View>
      </View>

      <View style={styles.modalMessageRow}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => {
            if (isModal) setModalVisible(false);
            handleMessagePress(msg);
          }}
        >
          <Text
            style={isModal ? styles.modalMessageText : styles.messageText}
            numberOfLines={1}
          >
            {msg.commentText}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => {
            if (isModal) setModalVisible(false);
            handleMessagePress(msg);
          }}
        >
          <Text style={styles.joinButtonText}>Reply</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.separator}></View>
    </View>
  );

  return (
    <>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>New Messages</Text>
          {sortedMessages.length > 2 && (
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          {sortedMessages.length === 0 ? (
            <Text style={styles.noMessageText}>No new messages</Text>
          ) : (
            previewMessages.map((msg) => renderMessageRow(msg))
          )}
        </View>
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>All New Messages</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>

            {sortedMessages.length === 0 ? (
              <Text style={styles.noMessageText}>No new messages</Text>
            ) : (
              <ScrollView style={styles.modalScroll}>
                {sortedMessages.map((msg) => renderMessageRow(msg, true))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fef9f0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  noMessageText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 8,
  },
  messageBlock: {
    marginBottom: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
    fontWeight: '500',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
  },
  timeText: {
    marginLeft: 10,
    fontSize: 12,
    color: '#999',
  },
   joinButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth:1,
    borderColor: '#257073',
  },
  joinButtonText: { 
    color: '#257073', 
    fontWeight: '600' 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000050',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#f9f6f0',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    fontSize: 26,
    fontWeight: '600',
    color: '#666',
  },
  modalScroll: {
    marginTop: 12,
  },
  modalMessageBlock: {
    marginBottom: 12,
  },
  modalMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
  },
  modalMessageText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
  },
  modalTimeText: {
    marginLeft: 10,
    fontSize: 12,
    color: '#999',
  },
});
