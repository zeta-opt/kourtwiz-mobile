import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useState } from 'react';

export const useMutateJoinPlay = () => {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  const joinPlaySession = async ({
    userId,
    sessionId,
    callbacks,
  }: {
    userId: string;
    sessionId: string;
    callbacks?: {
      onSuccess?: (data: any) => void;
      onError?: (error: Error) => void;
    };
  }): Promise<void> => {
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();
      console.log(
        `${BASE_URL}/api/play-type/bookings?sessionId=${sessionId}&userId=${userId}&isGuest=false`
      );

      const response = await axios.post(
        `${BASE_URL}/api/play-type/bookings`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            sessionId,
            userId,
            isGuest: false,
          },
        }
      );

      setStatus('success');
      callbacks?.onSuccess?.(response.data);
    } catch (err: any) {
      setStatus('error');
      console.log('join play error:', JSON.stringify(err));
      const errorMessage =
  err?.response?.data?.message ||
  (typeof err?.response?.data === 'string' ? err.response.data : null) ||
  err.message ||
  'Unknown error';

      setError(errorMessage);
      callbacks?.onError?.(new Error(errorMessage));
    }
  };

  return { joinPlaySession, status, error };
};
