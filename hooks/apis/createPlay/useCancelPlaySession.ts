import { useState } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

type Status = 'idle' | 'loading' | 'success' | 'error';

export const useCancelPlaySession = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [cancelledSessionId, setCancelledSessionId] = useState<string | null>(null);

  const cancelSession = async (sessionId: string) => {
    setStatus('loading');
    setCancelledSessionId(sessionId);
    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();
      if (!token) throw new Error('No token found');

      await axios.delete(`${BASE_URL}/api/play-type/sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      });

      setStatus('success');
      setError(null);
    } catch (err: any) {
      console.error('Cancel session error:', err);
      setStatus('error');
      setError(err.message || 'Error cancelling session');
    } finally {
      setCancelledSessionId(null);
    }
  };

  return {
    cancelSession,
    status,
    error,
    cancelledSessionId,
  };
};
