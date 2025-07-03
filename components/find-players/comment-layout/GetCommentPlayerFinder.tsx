import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Alert,
} from 'react-native';
import { useGetComments } from '@/hooks/apis/player-finder/useGetPlayerFinderComments';
import { useUpdateComment } from '@/hooks/apis/player-finder/useUpdatePlayerFinderComment';
import { useDeleteComment } from '@/hooks/apis/player-finder/useDeletePlayerFinderComment';

type Props = {
  requestId: string;
  userId: string;
  onMapReady?: (map: Map<string, string>) => void;
};

export const GetCommentPlayerFinder: React.FC<Props> = ({
  requestId,
  userId,
  onMapReady,
}) => {
  const { data, status, refetch } = useGetComments(requestId);
  const { update, status: updateStatus } = useUpdateComment();
  const { remove, status: deleteStatus } = useDeleteComment();

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [newText, setNewText] = useState('');

  const commentIdToUserIdMap = useMemo(() => {
    const map = new Map(
      data?.map((comment: any) => [comment.id, comment.userId]) ?? []
    );
    if (onMapReady) onMapReady(map);
    return map;
  }, [data]);

  const handleUpdate = async (commentId: string) => {
    await update({ commentId, userId, newText });
    setEditingCommentId(null);
    refetch();
  };

  const handleDelete = async (commentId: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await remove(commentId, userId);
          refetch();
        },
      },
    ]);
  };

  if (status === 'loading') return <Text>Loading comments...</Text>;
  if (status === 'error') return <Text>Failed to load comments.</Text>;

  return (
    <View>
      {data?.map((comment) => (
        <View key={comment.id} style={styles.commentCard}>
          <Text style={styles.userName}>{comment.userName}</Text>
          {editingCommentId === comment.id ? (
            <>
              <TextInput
                value={newText}
                onChangeText={setNewText}
                style={styles.input}
                placeholder="Update your comment"
              />
              <Button
                title="Submit"
                onPress={() => handleUpdate(comment.id)}
                disabled={updateStatus === 'loading'}
              />
              <Button title="Cancel" onPress={() => setEditingCommentId(null)} />
            </>
          ) : (
            <>
              <Text>{comment.commentText}</Text>
              {comment.userId === userId && (
                <View style={styles.actionRow}>
                  <Button
                    title="Edit"
                    onPress={() => {
                      setEditingCommentId(comment.id);
                      setNewText(comment.commentText);
                    }}
                  />
                  <View style={{ width: 10 }} />
                  <Button
                    title="Delete"
                    color="red"
                    onPress={() => handleDelete(comment.id)}
                    disabled={deleteStatus === 'loading'}
                  />
                </View>
              )}
            </>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  commentCard: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
  },
  userName: {
    fontWeight: 'bold',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    marginVertical: 8,
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});
