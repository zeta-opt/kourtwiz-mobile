import { useState } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

interface UnavailabilityData {
  reason: string;
  startTime: string;
  endTime: string;
  eventRepeatType: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  repeatEndDate?: string;
  repeatInterval?: number;
  repeatOnDays?: string[];
  repeatOnDates?: string[];
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export const useSetUnavailability = (userId: string) => {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const setUnavailability = async (data: UnavailabilityData): Promise<void> => {
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl || '';
      const token = await getToken();
      if (!token) throw new Error('No token found');

      await axios.post(`${BASE_URL}/api/player-calendar/set-unavalability?userId=${userId}`, data, {
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
    setUnavailability,
    status,
    error,
  };
};
