import axios from 'axios';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { getToken } from '@/shared/helpers/storeToken';

type PreferredPlayer = {
  userId: string;
  contactName: string;
  contactPhoneNumber: string;
};

type AvailablePlay = {
  id: string;
  userId: string;
  username: string;
  currentLocation: string;
  message: string;
  preferredPlayers: PreferredPlayer[];
  createdAt: number[];
  joinedPlayers: string[];
};

export const useGetAvailableIWantToPlay = (userId: string) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AvailablePlay[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      setStatus('loading');
      setError(null);

      try {
        const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
        const token = await getToken();

        const response = await axios.get(`${BASE_URL}/api/iwanttoplay/available/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: '*/*',
          },
        });

        setData(response.data || []);
        setStatus('success');
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err.message || 'Failed to fetch available plays';
        setStatus('error');
        setError(errorMessage);
      }
    };

    fetchData();
  }, [userId]);

  return { status, error, data };
};
