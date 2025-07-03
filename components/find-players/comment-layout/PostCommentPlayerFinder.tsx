import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, ActivityIndicator } from 'react-native';
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
  const { submit, status, error } = usePostComment();

  const handlePost = async () => {
    if (!commentText.trim()) {
      Alert.alert('Please enter a comment');
      return;
    }

    try {
      console.log('📨 Posting comment:', { requestId, userId, commentText });

      await submit({ requestId, userId, commentText });

      setCommentText('');
      onSuccess(); // refresh UI
    } catch (err) {
      console.error('❌ Failed to post comment', err);
      Alert.alert('Error', 'Failed to post comment');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Add a Comment:</Text>
      <TextInput
        value={commentText}
        onChangeText={setCommentText}
        placeholder="Write a comment..."
        style={styles.input}
        multiline
      />
      {status === 'loading' ? (
        <ActivityIndicator size="small" color="#6200ee" />
      ) : (
        <Button title="Post" onPress={handlePost} />
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
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    minHeight: 60,
    textAlignVertical: 'top',
    backgroundColor: 'white',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 8,
  },
});
