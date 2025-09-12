import { useState } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

interface OpenPlaySessionData {
  clubId: string;
  courtId: string;
  coachId?: string;
  startTime: string;
  durationMinutes: number;
  skillLevel: string;
  maxPlayers: number;
  playTypeName: string;
  priceForPlay: number;
  eventRepeatType?: string;
  repeatInterval?: number;
  repeatEndDate?: string;
  repeatOnDays?: string[];
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export const useCreateOpenPlaySession = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const createSession = async (sessionData: OpenPlaySessionData): Promise<void> => {
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl || '';
      const token = await getToken();
      if (!token) throw new Error('No token found');

      await axios.post(`${BASE_URL}/api/play-type/sessions`, sessionData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      });

      setStatus('success');
    } catch (err: any) {
      setStatus('error');

      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;
        setError(message || err.message || 'Failed to create session');
        throw new Error(message || err.message || 'Failed to create session'); // rethrow so component can catch
      } else {
        setError(err.message || 'Failed to create session');
        throw err;
      }
    }
  };

  return {
    createSession,
    status,
    error,
  };
};
