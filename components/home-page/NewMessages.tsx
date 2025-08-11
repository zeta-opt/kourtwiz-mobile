import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { useGetAvailableIWantToPlay } from '@/hooks/apis/iwanttoplay/useGetIWantToPlay';
import { format } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';

type NewMessagesProps = {
  userId: string;
};

const convertDateArrayToDate = (arr: number[]) => {
  if (!Array.isArray(arr) || arr.length < 6) return new Date();
  const [year, month, day, hour, minute, second] = arr;
  return new Date(year, month - 1, day, hour, minute, second);
};

const formatTime = (date: Date) => format(date, 'h:mm aa');

export default function NewMessages({ userId }: NewMessagesProps) {
  const { data: sessions } = useGetAvailableIWantToPlay(userId);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredSessions =
    sessions?.filter((session) => {
      const participants = session.preferredPlayers ?? [];
      const isUserInvited = participants.some((p) => p.userId === userId);
      const isCreator = session.userId === userId;
      return isUserInvited && !isCreator;
    }) || [];

  const sortedSessions = filteredSessions.sort((a, b) => {
    const dateA = convertDateArrayToDate(a.createdAt);
    const dateB = convertDateArrayToDate(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  const previewMessages = sortedSessions.slice(0, 2);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>New Messages</Text>
          {sortedSessions.length > 0 && (
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          {sortedSessions.length === 0 ? (
            <Text style={styles.noMessageText}>No new messages</Text>
          ) : (
            previewMessages.map((item) => {
              const createdAtDate = convertDateArrayToDate(item.createdAt);
              return (
                <View key={item.id} style={styles.messageBlock}>
                  <View style={styles.userRow}>
                    <MaterialIcons name="person" size={16} color="#444" />
                    <Text style={styles.username}>{item.username}</Text>
                  </View>
                  <View style={styles.messageRow}>
                    <Text style={styles.messageText} numberOfLines={1}>
                      {item.message}
                    </Text>
                    <Text style={styles.timeText}>{formatTime(createdAtDate)}</Text>
                  </View>
                </View>
              );
            })
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
            {sortedSessions.length === 0 ? (
              <Text style={styles.noMessageText}>No new messages</Text>
            ) : (
              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator>
                {sortedSessions.map((item) => {
                  const createdAtDate = convertDateArrayToDate(item.createdAt);
                  return (
                    <View key={item.id} style={styles.modalMessageBlock}>
                      <View style={styles.userRow}>
                        <MaterialIcons name="person" size={16} color="#444" />
                        <Text style={styles.username}>{item.username}</Text>
                      </View>
                      <View style={styles.modalMessageRow}>
                        <Text style={styles.modalMessageText}>{item.message}</Text>
                        <Text style={styles.modalTimeText}>
                          {formatTime(createdAtDate)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
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
    paddingTop: 10,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#f9f6f0',
    borderRadius: 14,
    width: '100%',
    maxHeight: '80%',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
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
