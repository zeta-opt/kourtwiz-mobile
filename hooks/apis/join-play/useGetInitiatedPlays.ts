
import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useCallback, useEffect, useState } from 'react';

export const useGetInitiatedPlays = (userId?: string) => {
  const [data, setData] = useState<any | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    if (!userId) return;
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      const response = await axios.get(
        `${BASE_URL}/api/play-type/events/initiated/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: '*/*',
          },
        }
      );

      setData(response.data);
      setStatus('success');
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err.message || 'Something went wrong';
      setError(errorMessage);
      setStatus('error');
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchSession();
    }
  }, [userId, fetchSession]);

  return {
    data,
    status,
    error,
    refetch: fetchSession,
  };
};
