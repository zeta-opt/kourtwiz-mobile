import { useState } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

type UpdateCommentPayload = {
  commentId: string;
  userId: string;
  newText: string;
};

type UseUpdateCommentReturn = {
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  update: (payload: UpdateCommentPayload) => Promise<void>;
};

export const useUpdateComment = (): UseUpdateCommentReturn => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const update = async ({ commentId, userId, newText }: UpdateCommentPayload) => {
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      if (!BASE_URL) throw new Error('BASE_URL is undefined');
      if (!token) throw new Error('Missing token');

      await axios.put(
        `${BASE_URL}/api/player-finder/comments/${commentId}`,
        {
          userId,
          newText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Comment updated');
      setStatus('success');
    } catch (err: any) {
      console.error('❌ Error updating comment:', err?.response?.data || err.message);
      setError(err?.response?.data?.message || 'Something went wrong');
      setStatus('error');
    }
  };

  return { status, error, update };
};
