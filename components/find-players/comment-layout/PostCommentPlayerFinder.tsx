import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  Text,
  ActivityIndicator,
  Image,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { usePostComment } from '@/hooks/apis/player-finder/usePostPlayerFinderComment';

type Props = {
  requestId: string;
  userId: string;
  onSuccess: () => void;
};

export const PostCommentPlayerFinder: React.FC<Props> = ({
  requestId,
  userId,
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
      await submit({
        requestId,
        userId,
        commentText: commentText.trim(),
        image: image || null,
      });

      // Reset only on success
      setCommentText('');
      setImage(null);
      onSuccess();
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
      {/* <Text style={styles.label}>Add a Comment:</Text> */}

      <View style={styles.row}>
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Type your message here..."
          placeholderTextColor="#000000"
          multiline
          style={styles.input}
        />

        <IconButton
          icon="camera"
          iconColor="#007A7A"
          size={24}
          onPress={handlePickImage}
        />

        {status === 'loading' ? (
          <ActivityIndicator size="small" color="#007A7A" />
        ) : (
          <IconButton
            icon="send"
            iconColor="#007A7A"
            size={24}
            onPress={handlePost}
            disabled={!commentText.trim() && !image}
          />
        )}
      </View>

      {image && (
        <Image source={{ uri: image.uri }} style={styles.previewImage} />
      )}

      {status === 'error' && (
        <Text style={styles.errorText}>{error || 'Something went wrong'}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: 'white',
    textAlignVertical: 'top',
    
  },
  previewImage: {
    width: 100,
    height: 100,
    marginTop: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  errorText: {
    color: 'red',
    marginTop: 8,
  },
});
