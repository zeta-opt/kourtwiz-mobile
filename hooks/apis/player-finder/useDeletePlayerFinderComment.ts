import { useState } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

type UseDeleteCommentReturn = {
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  remove: (commentId: string, userId: string) => Promise<void>;
};

export const useDeleteComment = (): UseDeleteCommentReturn => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const remove = async (commentId: string, userId: string) => {
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      if (!BASE_URL) throw new Error('BASE_URL is undefined');
      if (!token) throw new Error('Missing token');

      await axios.delete(
        `${BASE_URL}/api/player-finder/comments/${commentId}?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      console.log('🗑️ Comment deleted');
      setStatus('success');
    } catch (err: any) {
      console.error('❌ Error deleting comment:', err?.response?.data || err.message);
      setError(err?.response?.data?.message || 'Something went wrong');
      setStatus('error');
    }
  };

  return { status, error, remove };
};
