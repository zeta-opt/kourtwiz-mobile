import { useState, useEffect } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

type Status = 'idle' | 'loading' | 'success' | 'error';

export const useCancelPlaySession = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [cancelledSessionId, setCancelledSessionId] = useState<string | null>(null);
  const [refetchFlag, setRefetchFlag] = useState(false);

  const cancelSession = async (sessionId: string) => {
    try {
      setStatus('loading');
      setCancelledSessionId(sessionId);
      const token = await getToken();
      if (!token) throw new Error('No token found');

      await axios.delete(`${BASE_URL}/api/play-type/sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStatus('success');
      setError(null);
      setRefetchFlag((prev) => !prev);
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
    refetch: () => setRefetchFlag((prev) => !prev),
  };
};
