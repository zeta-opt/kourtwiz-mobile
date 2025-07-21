import { useState, useEffect } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

export const usePlayersNearby = (userId: string, days: number) => {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (!userId) return;

  const fetchNearby = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      
      console.log('📦 Token from getToken():', token);
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

      console.log('Calling API with:', userId, BASE_URL, days);

      const res = await axios.get(
        `${BASE_URL}/api/bookings/user-data/${userId}/date-range?dateRange=${days}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log('API response:', res.data);

      setData(res.data || []);
    } catch (err: any) {
  console.error('Full error object:', err);

  const message =
    err?.response?.data?.message || err?.message || 'Something went wrong';

  console.error('API Error:', message);
  setError(message);
} finally {
      setLoading(false);
    }
  };

  fetchNearby();
}, [userId, days]);

  return { data, error, loading };
};
