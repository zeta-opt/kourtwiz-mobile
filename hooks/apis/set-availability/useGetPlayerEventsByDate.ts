import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useCallback, useEffect, useState } from 'react';

export const useGetPlayerEventsByDate = (
  date?: string, 
  userId?: string,
  lat?: number,
  lng?: number
) => {
  const [data, setData] = useState<any | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!date || !userId|| lat == null || lng == null) return;
  
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      const response = await axios.get(`${BASE_URL}/player-calendar/events-by-date`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: '*/*',
        },
        params: {
          userId,
          date,
          lat,
          lng,
        },
      });

      setData(response.data);
      setStatus('success');
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err.message || 'Something went wrong';
      setError(errorMessage);
      setStatus('error');
    }
  }, [date, userId, lat, lng]);

  useEffect(() => {
    if (date && userId && lat != null && lng != null) {
      fetchEvents();
    }
  }, [date, userId, lat, lng, fetchEvents]);

  return {
    data,
    status,
    error,
    refetch: fetchEvents,
  };
};
