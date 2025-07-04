import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Modal, Pressable, TouchableOpacity } from 'react-native';
import { useGetComments } from '@/hooks/apis/player-finder/useGetPlayerFinderComments';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

type Props = {
  requestId: string;
  onRefetchAvailable: (refetch: () => void) => void;
};

export const GetCommentPlayerFinder: React.FC<Props> = ({
  requestId,
  onRefetchAvailable,
}) => {
  const { data, status, refetch } = useGetComments(requestId);
  const { user } = useSelector((state: RootState) => state.auth);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalImageUri, setModalImageUri] = useState<string | null>(null);

  const openModal = (uri: string) => {
    setModalImageUri(uri);
    setModalVisible(true);
  };

  useEffect(() => {
    onRefetchAvailable(refetch);
  }, []);

  if (status === 'loading') return <Text style={styles.infoText}>Loading comments...</Text>;
  if (status === 'error') return <Text style={styles.infoText}>Failed to load comments.</Text>;
  if (!data || data.length === 0) return <Text style={styles.infoText}>No comments yet.</Text>;

  return (
    <View>
      {data.map((comment) => {
        const isOwnMessage = comment.userId === user?.userId;
        const hasText = !!comment.commentText?.trim();
        const hasImage = !!comment.image;
        const imageUri = hasImage ? `data:image/jpeg;base64,${comment.image}` : null;

        if (!hasText && !hasImage) return null;

        return (
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
              <Text style={styles.userName}>{comment.userName}</Text>
              {hasText && <Text style={styles.commentText}>{comment.commentText}</Text>}
              {imageUri && (
                <Pressable onPress={() => openModal(imageUri)}>
                  <Image source={{ uri: imageUri }} style={styles.commentImage} />
                </Pressable>
              )}
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
    marginBottom: 10,
  },
  alignRight: {
    justifyContent: 'flex-end',
  },
  alignLeft: {
    justifyContent: 'flex-start',
  },
  commentBubble: {
    maxWidth: '75%',
    borderRadius: 10,
    padding: 8,
  },
  ownBubble: {
    backgroundColor: '#d1e7dd',
    borderTopRightRadius: 0,
  },
  otherBubble: {
    backgroundColor: '#f1f1f1',
    borderTopLeftRadius: 0,
  },
  userName: {
    fontWeight: '600',
    fontSize: 12,
    color: '#444',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
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
});
