import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useCallback, useState } from 'react';

type UseWithdrawRequestReturn = {
  withdrawRequest: (requestId: string, userId: string, comment?: string) => Promise<void>;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  refetch: () => void;
};

export const useWithdrawRequest = (): UseWithdrawRequestReturn => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [refetchFlag, setRefetchFlag] = useState(false);

  const refetch = () => {
    setRefetchFlag(prev => !prev);
  };

  const withdrawRequest = useCallback(async (requestId: string, userId: string, comment: string = '') => {
    setStatus('loading');
    setError(null);
    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      const cancelUrl = `${BASE_URL}/api/player-finder-queue/cancelByRequester?requestId=${requestId}&requestorId=${userId}&comments=${encodeURIComponent(comment)}`;

      const response = await axios.get(cancelUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: '*/*',
        },
      });

      console.log('Cancel response:', response.data);
      setStatus('success');
      refetch();
    } catch (err: any) {
      console.error('Cancel error:', err);
      setError(err?.message || 'Unknown error');
      setStatus('error');
    }
  }, []);

  return {
    withdrawRequest,
    status,
    error,
    refetch,
  };
};
