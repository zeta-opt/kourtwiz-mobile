import { useState } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

type AddCommentPayload = {
  requestId: string;
  userId: string;
  commentText: string;
};

type UsePostCommentReturn = {
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  submit: (payload: AddCommentPayload) => Promise<void>;
};

export const usePostComment = (): UsePostCommentReturn => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (payload: AddCommentPayload) => {
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      // Debug logs
      console.log('🟢 BASE_URL:', BASE_URL);
      console.log('🟢 Token:', token);
      console.log('📦 Payload:', payload);

      if (!BASE_URL) throw new Error('BASE_URL is undefined');
      if (!token) throw new Error('Missing token');

      await axios.post(`${BASE_URL}/api/player-finder/comments`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ Comment successfully submitted');
      setStatus('success');
    } catch (err: any) {
      console.error('❌ Error submitting comment:', err?.response?.data || err.message);
      setError(err?.response?.data?.message || 'Something went wrong');
      setStatus('error');
    }
  };

  return { status, error, submit };
};
