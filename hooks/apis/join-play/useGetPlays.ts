import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useCallback, useEffect, useState } from 'react';

export const useGetPlays = (clubId: string) => {
  const [data, setData] = useState<any | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading'
  );
  const [error, setError] = useState<string | null>(null);

  const fetchPlays = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      const response = await axios.get(
        `${BASE_URL}/api/play-type/sessions/available?clubId=${clubId}`,
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
      console.error('Failed to fetch membership plans:', err);
      const errorMessage =
        err?.response?.data?.message || err.message || 'Something went wrong';
      setError(errorMessage);
      setStatus('error');
    }
  }, [clubId]);

  useEffect(() => {
    if (clubId) {
      fetchPlays();
    }
  }, [clubId, fetchPlays]);

  return {
    data,
    status,
    error,
    refetch: fetchPlays,
  };
};
