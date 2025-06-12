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
    try {
      setStatus('loading');
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
      setError(null);
    } catch (err: any) {
      console.error('Create session error:', err);
      setStatus('error');
      setError(err.message || 'Error creating session');
    }
  };

  return {
    createSession,
    status,
    error,
  };
};
