import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
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
  const [menuVisibleId, setMenuVisibleId] = useState<string | null>(null);
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
          <View style={styles.headerRow}>
            <Text style={styles.userName}>{comment.userName}</Text>

            {comment.userId === userId && (
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  onPress={() =>
                    setMenuVisibleId(menuVisibleId === comment.id ? null : comment.id)
                  }
                >
                  <Text style={styles.dots}>⋮</Text>
                </TouchableOpacity>

                {menuVisibleId === comment.id && (
                  <View style={styles.popupMenu}>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingCommentId(comment.id);
                        setNewText(comment.commentText);
                        setMenuVisibleId(null);
                      }}
                    >
                      <Text style={styles.popupItem}>✏️ Edit</Text>
                    </TouchableOpacity>

                    <View style={styles.separator} />

                    <TouchableOpacity
                      onPress={() => {
                        handleDelete(comment.id);
                        setMenuVisibleId(null);
                      }}
                    >
                      <Text style={[styles.popupItem, { color: 'red' }]}>🗑️ Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

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
            <Text>{comment.commentText}</Text>
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
    borderRadius: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  dots: {
    fontSize: 22,
    padding: 8,
    textAlign: 'center',
  },
  menuContainer: {
    position: 'relative',
    alignItems: 'flex-end',
  },
  popupMenu: {
    position: 'absolute',
    top: 32,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
    minWidth: 130,
  },
  popupItem: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    marginVertical: 8,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
});
