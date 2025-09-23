import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Modal,
  Pressable,
  TouchableOpacity,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useGetComments } from '@/hooks/apis/player-finder/useGetPlayerFinderComments';
import { useUpdateComment } from '@/hooks/apis/player-finder/useUpdatePlayerFinderComment';
import { useDeleteComment } from '@/hooks/apis/player-finder/useDeletePlayerFinderComment';
import { formatTime } from '@/components/home-page/NewMessages';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { IconButton } from 'react-native-paper';

const parseCommentTimestamp = (ts: number[] | string | null | undefined): Date => {
  if (!ts) return new Date(NaN);
  if (Array.isArray(ts)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = ts;
    return new Date(year, month - 1, day, hour, minute, second);
  }
  if (typeof ts === 'string') return new Date(ts);
  return new Date(NaN);
};

const formatMessageDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  if (isSameDay(date, today)) {
    return "Today";
  } else if (isSameDay(date, yesterday)) {
    return "Yesterday";
  }

  // within last 7 days → show weekday
  const diffInDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffInDays < 7) {
    return date.toLocaleDateString([], { weekday: "long" }); // e.g. Saturday
  }

  // else → show full date
  return date.toLocaleDateString([], { day: "2-digit", month: "long", year: "numeric" });
};

type Props = {
  requestId: string;
  onRefetchAvailable: (refetch: () => void) => void;
};

export const GetCommentPlayerFinder: React.FC<Props> = ({
  requestId,
  onRefetchAvailable,
}) => {
  const { data, status, refetch } = useGetComments(requestId);
  const { update, status: updateStatus } = useUpdateComment();
  const { remove } = useDeleteComment();
  const { user } = useSelector((state: RootState) => state.auth);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalImageUri, setModalImageUri] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [newText, setNewText] = useState('');
  const [menuVisibleId, setMenuVisibleId] = useState<string | null>(null);

  const openModal = (uri: string) => {
    setModalImageUri(uri);
    setModalVisible(true);
  };

  useEffect(() => {
    onRefetchAvailable(refetch);
  }, []);

  const handleUpdate = async (commentId: string) => {
    await update({ commentId, userId: user?.userId, newText });
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
          await remove(commentId, user?.userId);
          refetch();
        },
      },
    ]);
  };

  if (status === 'loading') return <Text style={styles.infoText}>Loading comments...</Text>;
  if (status === 'error') return <Text style={styles.infoText}>Failed to load comments.</Text>;
  if (!data || data.length === 0) return <Text style={styles.infoText}>No comments yet.</Text>;

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        if (menuVisibleId) setMenuVisibleId(null);
      }}
    >
      <View style={{ flex: 1 }}>
        {data.map((comment, index) => {
          const isOwnMessage = comment.userId === user?.userId;
          const hasText = !!comment.commentText?.trim();
          const hasImage = !!comment.image;
          const imageUri = hasImage ? `data:image/jpeg;base64,${comment.image}` : null;
          
          const currentDate = parseCommentTimestamp(comment.timestamp);
          const prevComment = index > 0 ? data[index - 1] : null;
          const prevDate = prevComment ? parseCommentTimestamp(prevComment.timestamp) : null;
          const showDateHeader =
            !prevDate || currentDate.toDateString() !== prevDate.toDateString();

          if (!hasText && !hasImage) return null;

          return (
            <View key={comment.id}>
              {showDateHeader && (
                <View style={styles.dateHeader}>
                  <Text style={styles.dateHeaderText}>{formatMessageDate(currentDate)}</Text>
                </View>
              )}
              <View
                key={comment.id}
                style={[
                  styles.commentWrapper,
                  isOwnMessage ? styles.alignRight : styles.alignLeft,
                ]}
              >
                <View
                  style={[
                    styles.commentBubble,
                    isOwnMessage ? styles.ownBubble : styles.otherBubble,
                  ]}
                >
                  <View style={styles.headerRow}>
                    <Text style={styles.userName}>{comment.userName}</Text>

                    {isOwnMessage && (
                      <View style={styles.menuContainer}>
                        <IconButton
                          icon="dots-vertical"
                          size={18}
                          onPress={() =>
                            setMenuVisibleId(menuVisibleId === comment.id ? null : comment.id)
                          }
                        />

                        {menuVisibleId === comment.id && (
                          <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={styles.popupMenu}>
                              <TouchableOpacity
                                onPress={() => {
                                  setEditingCommentId(comment.id);
                                  setNewText(comment.commentText);
                                  setMenuVisibleId(null);
                                }}
                              >
                                <Text style={styles.popupItem}>✏ Edit</Text>
                              </TouchableOpacity>

                              <View style={styles.separator} />

                              <TouchableOpacity
                                onPress={() => {
                                  handleDelete(comment.id);
                                  setMenuVisibleId(null);
                                }}
                              >
                                <Text style={[styles.popupItem, { color: 'red' }]}>🗑 Delete</Text>
                              </TouchableOpacity>
                            </View>
                          </TouchableWithoutFeedback>
                        )}
                      </View>
                    )}
                  </View>

                  {editingCommentId === comment.id ? (
                    <>
                      <TextInput
                        value={newText}
                        onChangeText={setNewText}
                        placeholder="Edit your comment"
                        style={styles.input}
                        multiline
                      />
                      <View style={styles.buttonRow}>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.updateBtn]}
                          onPress={() => handleUpdate(comment.id)}
                          disabled={updateStatus === 'loading'}
                        >
                          <Text style={styles.actionText}>Update</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.cancelBtn]}
                          onPress={() => setEditingCommentId(null)}
                        >
                          <Text style={styles.actionText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      {hasText && <Text style={styles.commentText}>{comment.commentText}</Text>}
                      {imageUri && (
                        <Pressable onPress={() => openModal(imageUri)}>
                          <Image source={{ uri: imageUri }} style={styles.commentImage} />
                        </Pressable>
                      )}
                      <Text style={styles.timeText}>{formatTime(comment.timestamp)}</Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <View style={styles.modalBackground}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>
            {modalImageUri && (
              <Image source={{ uri: modalImageUri }} style={styles.fullImage} resizeMode="contain" />
            )}
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  infoText: {
    fontSize: 14,
    color: 'gray',
    paddingVertical: 5,
    textAlign: 'center',
  },
  commentWrapper: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  alignRight: {
    justifyContent: 'flex-end',
  },
  alignLeft: {
    justifyContent: 'flex-start',
  },
  commentBubble: {
    maxWidth: '75%',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  timeText: {
    fontSize: 12,
    color: '#707388',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  dateHeader: {
    alignSelf: "center",
    backgroundColor: "#999",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 10,
  },
  dateHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  ownBubble: {
    backgroundColor: '#DAF1F3',
    borderTopRightRadius: 0,
  },
  otherBubble: {
    backgroundColor: '#F1F2F6',
    borderTopLeftRadius: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 12,
    color: '#444',
  },
  commentText: {
    fontSize: 14,
    color: '#333333',
    marginTop: 2,
  },
  commentImage: {
    width: 140,
    height: 140,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: '#000000dd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2,
  },
  closeText: {
    fontSize: 24,
    color: 'white',
  },
  menuContainer: {
    position: 'relative',
  },
  popupMenu: {
    position: 'absolute',
    top: 24,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 120,
    zIndex: 10,
  },
  popupItem: {
    fontSize: 14,
    paddingVertical: 6,
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
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  actionBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 6,
  },
  updateBtn: {
    backgroundColor: '#4caf50',
  },
  cancelBtn: {
    backgroundColor: '#f44336',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});
