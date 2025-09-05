import { useState } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

interface UnavailabilityData {
  sessionsId: string;
  title: string;
  reason: string;
  startTime: string;
  endTime: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export const useUpdatetUnavailability = (userId: string) => {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const updateUnavailability = async (data: UnavailabilityData): Promise<void> => {
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl || '';
      const token = await getToken();
      if (!token) throw new Error('No token found');

      await axios.post(`${BASE_URL}/player-calendar/edit-unavailability?userId=${userId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      });

      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    }
  };

  return {
    updateUnavailability,
    status,
    error,
  };
};
