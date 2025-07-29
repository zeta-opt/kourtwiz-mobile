import axios from 'axios';
import Constants from 'expo-constants';
import { useState } from 'react';
import { getToken } from '@/shared/helpers/storeToken';

export const useJoinIWantToPlay = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const joinSession = async ({
    sessionId,
    userId,
    callbacks,
  }: {
    sessionId: string;
    userId: string;
    callbacks?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    };
  }) => {
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      await axios.post(
        `${BASE_URL}/api/iwanttoplay/join/${sessionId}?userId=${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: '*/*',
          },
        }
      );

      setStatus('success');
      callbacks?.onSuccess?.();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to join session';
      setStatus('error');
      setError(errorMessage);
      callbacks?.onError?.(new Error(errorMessage));
      console.error('Join failed:', err);
    }
  };

  return { joinSession, status, error };
};
