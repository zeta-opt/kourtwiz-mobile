import { getToken } from '@/shared/helpers/storeToken';
import axios, { isAxiosError } from 'axios';
import Constants from 'expo-constants';
import { useState } from 'react';

interface GameFeedbackPayload {
  gameId: string;
  playerId: string;
  opponentId?: string;
  location: string;
  rating: number;
  positives: string[];
  comments: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export const useSubmitGameFeedback = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const submitGameFeedback = async (
    feedbackData: GameFeedbackPayload
  ): Promise<void> => {
    try {
      setStatus('loading');
      setError(null);

      const BASE_URL = Constants.expoConfig?.extra?.apiUrl || '';
      const token = await getToken();

      if (!token) {
        throw new Error('No token found');
      }

      await axios.post(`${BASE_URL}/api/game_feedback`, feedbackData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      });

      setStatus('success');
    } catch (err) {
      setStatus('error');
      if (isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to submit game feedback'
        );
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    }
  };

  const resetStatus = () => {
    setStatus('idle');
    setError(null);
  };

  return {
    submitGameFeedback,
    status,
    error,
    resetStatus,
  };
};
