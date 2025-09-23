import { usePostComment } from '@/hooks/apis/player-finder/usePostPlayerFinderComment';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { IconButton } from 'react-native-paper';

type Props = {
  requestId: string;
  userId: string;
  receiverUserId?: string | null;
  onSuccess: () => void;
};

export const PostCommentPlayerFinder: React.FC<Props> = ({
  requestId,
  userId,
  receiverUserId,
  onSuccess,
}) => {
  const [commentText, setCommentText] = useState('');
  const [image, setImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const { submit, status, error } = usePostComment();

  const handlePost = async () => {
    if (!commentText.trim() && !image) {
      Alert.alert('Validation', 'Please enter a comment or pick an image.');
      return;
    }

    try {
      const payload: any = {
        requestId,
        userId,
        commentText: commentText.trim(),
        image: image || null,
      };

      // Only include receiverUserId if it exists (for individual messages)
      if (receiverUserId) {
        payload.receiverUserId = receiverUserId;
      }

      await submit(payload);

      // Reset only on success
      setCommentText('');
      setImage(null);
      onSuccess();
      Keyboard.dismiss();
    } catch {
      Alert.alert('Error', 'Failed to post comment.');
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: false,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const picked = result.assets[0];
      setImage({
        uri: picked.uri,
        name: picked.fileName || picked.uri.split('/').pop() || 'image.jpg',
        type: picked.type || 'image/jpeg',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder='Type your message here...'
          placeholderTextColor='#999'
          multiline
          style={styles.input}
          maxLength={500}
          returnKeyType='default'
          blurOnSubmit={false}
          textAlignVertical='center'
        />
        <IconButton
          icon='camera'
          iconColor='#007A7A'
          size={24}
          onPress={handlePickImage}
          style={styles.iconButton}
        />
        {status === 'loading' ? (
          <ActivityIndicator size='small' color='#007A7A' />
        ) : (
          <IconButton
            icon='send'
            iconColor='#007A7A'
            size={24}
            onPress={handlePost}
            disabled={!commentText.trim() && !image}
            style={styles.iconButton}
          />
        )}
      </View>

      {image && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
          <IconButton
            icon='close'
            iconColor='#fff'
            size={16}
            onPress={() => setImage(null)}
            style={styles.removeImageButton}
          />
        </View>
      )}

      {status === 'error' && (
        <Text style={styles.errorText}>{error || 'Something went wrong'}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: 'white',
    fontSize: 16,
    color: '#000',
  },
  iconButton: {
    margin: 0,
  },
  imagePreviewContainer: {
    marginTop: 8,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    width: 20,
    height: 20,
    margin: 0,
  },
  errorText: {
    color: '#ff3b30',
    marginTop: 4,
    fontSize: 12,
  },
});
