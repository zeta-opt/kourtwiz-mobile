import { useState } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import * as ImageManipulator from 'expo-image-manipulator';
import { getToken } from '@/shared/helpers/storeToken';

type AddCommentPayload = {
  requestId: string;
  userId: string;
  receiverUserId?: string | null;
  commentText?: string;
  image?: {
    uri: string;
    name: string;
    type: string;
  } | null;
};

type UsePostCommentReturn = {
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  submit: (payload: AddCommentPayload) => Promise<void>;
};

export const usePostComment = (): UsePostCommentReturn => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Utility: extract base requestId (before underscores)
  const getBaseRequestId = (requestId: string) => requestId.split('_')[0];

  const submit = async (payload: AddCommentPayload) => {
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      if (!BASE_URL) throw new Error('BASE_URL is undefined');
      if (!token) throw new Error('Missing token');

      const formData = new FormData();

      // Always send only the base requestId
      const baseRequestId = getBaseRequestId(payload.requestId);
      formData.append('requestId', baseRequestId);
      formData.append('userId', payload.userId);

      if (payload.receiverUserId) {
        formData.append('receiverUserId', payload.receiverUserId);
      }

      if (payload.commentText) {
        formData.append('commentText', payload.commentText);
      }

      if (payload.image?.uri) {
        console.log('🖼️ Compressing image...');

        const manipulated = await ImageManipulator.manipulateAsync(
          payload.image.uri,
          [],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        formData.append('image', {
          uri: manipulated.uri,
          name: payload.image.name || 'photo.jpg',
          type: 'image/jpeg',
        } as any);
      }

      console.log('📤 Sending POST request with FormData...', {
        requestId: baseRequestId,
        userId: payload.userId,
        receiverUserId: payload.receiverUserId,
        commentText: payload.commentText,
      });

      await axios.post(`${BASE_URL}/api/player-finder/comments`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Comment posted successfully!');
      setStatus('success');
    } catch (err: any) {
      console.error('❌ Error submitting comment:', err?.response || err?.message || err);
      setError(err?.message || 'Something went wrong');
      setStatus('error');
    }
  };

  return { status, error, submit };
};
