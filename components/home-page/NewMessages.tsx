import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useGetAvailableIWantToPlay } from '@/hooks/apis/iwanttoplay/useGetIWantToPlay';
import { formatDistanceToNow } from 'date-fns';

type NewMessagesProps = {
  userId: string;
};

const convertDateArrayToDate = (arr: number[]) => {
  if (!Array.isArray(arr) || arr.length < 6) return new Date();
  const [year, month, day, hour, minute, second] = arr;
  return new Date(year, month - 1, day, hour, minute, second);
};

export default function NewMessages({ userId }: NewMessagesProps) {
  const { data: sessions } = useGetAvailableIWantToPlay(userId);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!sessions || sessions.length === 0) return null;

  // Filter sessions:
  const filteredSessions = sessions.filter(session => {
    const participants = session.preferredPlayers ?? [];
    const isUserInvited = participants.some(p => p.userId === userId);
    const isCreator = session.userId === userId;
    return isUserInvited && !isCreator;
  });

  if (filteredSessions.length === 0) {
    console.warn("No new messages relevant to this user.");
    return null;
  }

  // Sort by createdAt
  const sortedSessions = filteredSessions.sort((a, b) => {
    const dateA = convertDateArrayToDate(a.createdAt);
    const dateB = convertDateArrayToDate(b.createdAt);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>New Messages</Text>

      <ScrollView
        style={{ height: 200 }}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {sortedSessions.map((item) => {
          const isExpanded = expandedId === item.id;
          const messagePreview = item.message.length > 50
            ? item.message.slice(0, 50) + '...'
            : item.message;

          const createdAtDate = convertDateArrayToDate(item.createdAt);

          return (
            <View key={item.id} style={styles.messageCard}>
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <Text style={styles.sender}>{item.username}</Text>
                    </View>
                    <Text style={styles.timestamp}>
                        {formatDistanceToNow(createdAtDate, { addSuffix: true })}
                    </Text>
                </View>

              <TouchableOpacity onPress={() => setExpandedId(isExpanded ? null : item.id)}>
                <Text style={styles.messageText}>
                  {isExpanded ? item.message : messagePreview}
                  {item.message.length > 50 && (
                    <Text style={styles.dropdownArrow}> {isExpanded ? '▲' : '▼'}</Text>
                  )}
                </Text>
              </TouchableOpacity>

              <View style={styles.separator} />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: 14,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noMessages: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
  },
  messageCard: {
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sender: {
    fontSize: 16,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: '#007bff',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  messageText: {
    marginTop: 6,
    color: '#444',
  },
  dropdownArrow: {
    color: '#666',
  },
  timestamp: {
    marginTop: 4,
    fontSize: 12,
    color: '#999',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginVertical: 8,
  },
});
