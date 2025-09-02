import { useState } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

interface UpdatePlaySessionData {
  sessionId: string;
  clubId?: string;
  courtId?: string;
  coachId?: string;
  startTime?: string;
  durationMinutes?: number;
  skillLevel?: string;
  maxPlayers?: number;
  playTypeName?: string;
  priceForPlay?: number;
  eventRepeatType?: string;
  repeatInterval?: number;
  repeatEndDate?: string;
  repeatOnDays?: string[];
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export const useUpdateOpenPlaySession = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const updateSession = async (sessionData: UpdatePlaySessionData): Promise<void> => {
    setStatus('loading');

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl || '';
      const token = await getToken();
      if (!token) throw new Error('No token found');

      await axios.put(
        `${BASE_URL}/api/play-type/update/event/${sessionData.sessionId}`,
        sessionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
        }
      );

      setStatus('success');
      setError(null);
    } catch (err: any) {
      console.error('Error updating session:', err);
      setStatus('error');
      setError(err.message || 'Failed to update session');
    }
  };

  return {
    updateSession,
    status,
    error,
  };
};
