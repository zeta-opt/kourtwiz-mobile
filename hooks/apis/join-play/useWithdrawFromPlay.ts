// hooks/apis/join-play/useWithdrawFromPlay.ts
import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useCallback, useState } from 'react';

type WithdrawParams = {
  sessionId: string;
  userId: string;
};

export const useWithdrawFromPlay = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const withdraw = useCallback(async ({ sessionId, userId }: WithdrawParams) => {
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      await axios.delete(`${BASE_URL}/api/play-type/bookings/${sessionId}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: '*/*',
        },
      });

      setStatus('success');
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || 'Something went wrong';
      setError(message);
      setStatus('error');
    }
  }, []);

  return {
    withdraw,
    status,
    error,
  };
};
