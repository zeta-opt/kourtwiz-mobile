import React from 'react';
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useGetComments } from '@/hooks/apis/player-finder/useGetPlayerFinderComments';

type Props = {
  requestId: string;
};

export const GetCommentPlayerFinder: React.FC<Props> = ({ requestId }) => {
  const { data, status, refetch } = useGetComments(requestId);
  // console.log('Comments data:', data);
  const commentIdToUserIdMap = React.useMemo(() => {
  return new Map(data?.map((comment: any) => [comment.id, comment.userId]) ?? []);
}, [data]);

// console.log('🗺️ CommentID → UserID Map:', commentIdToUserIdMap);

  if (status === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' color='#0000ff' />
        <Text>Loading comments...</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load comments.</Text>
        <Button title='Retry' onPress={refetch} />
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No comments found.</Text>
        <Button title='Refresh' onPress={refetch} />
      </View>
    );
  }
  

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      onRefresh={refetch}
      refreshing={status === 'loading'}
      renderItem={({ item }) => (
        <View style={styles.commentCard}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.commentText}>{item.commentText}</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  commentCard: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: 'gray',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
});
