// hooks/apis/open-play/useCancelOpenPlay.ts
import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useCallback, useState } from 'react';

type CancelParams = {
  sessionId: string;
};

export const useCancelOpenPlay = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const cancel = useCallback(async ({ sessionId }: CancelParams) => {
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      await axios.delete(`${BASE_URL}/api/play-type/sessions/${sessionId}`, {
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
    cancel,
    status,
    error,
  };
};
