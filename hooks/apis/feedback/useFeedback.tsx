import { getToken } from '@/shared/helpers/storeToken';
import axios, { isAxiosError } from 'axios';
import Constants from 'expo-constants';
import { useState } from 'react';

interface FeedbackPayload {
  userId: string;
  userName: string;
  clubId?: string;
  title: string;
  message: string;
  category: 'BUG' | 'FEATURE' | 'SUGGESTION';
  visibility: 'PUBLIC' | 'PRIVATE';
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export const useFeedback = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const submitFeedback = async (
    feedbackData: FeedbackPayload
  ): Promise<void> => {
    try {
      setStatus('loading');
      setError(null);

      const BASE_URL = Constants.expoConfig?.extra?.apiUrl || '';
      const token = await getToken();

      if (!token) {
        throw new Error('No token found');
      }

      await axios.post(`${BASE_URL}/api/feedback`, feedbackData, {
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
            'Failed to submit feedback'
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
    submitFeedback,
    status,
    error,
    resetStatus,
  };
};
