import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useCallback, useEffect, useState } from 'react';

type Status = 'loading' | 'error' | 'success';

export const useGetPlayerSchedule = (
  userId?: string,
  lat?: number,
  lng?: number
) => {
  const [data, setData] = useState<any | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    if (!userId || lat == null || lng == null) return;

    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      const response = await axios.get(
        `${BASE_URL}/player-calendar/all-events`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: '*/*',
          },
          params: {
            userId,
            lat,
            lng,
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
  }, [userId, lat, lng]);

  useEffect(() => {
    if (userId && lat != null && lng != null) {
      fetchSchedule();
    }
  }, [userId, lat, lng, fetchSchedule]);

  return {
    data,
    status,
    error,
    refetch: fetchSchedule,
  };
};
