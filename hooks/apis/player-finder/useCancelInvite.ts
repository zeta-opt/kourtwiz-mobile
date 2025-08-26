import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useCallback, useState } from 'react';

type UseCancelInvitationReturn = {
  cancelInvitation: (requestId: string, userId: string, comment?: string) => Promise<boolean>;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
};

export const useCancelInvitation = (refetch: () => void): UseCancelInvitationReturn => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const cancelInvitation = useCallback(
    async (requestId: string, userId: string, comment: string = ''): Promise<boolean> => {
      setStatus('loading');
      setError(null);

      try {
        const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
        const token = await getToken();

        const cancelUrl = `${BASE_URL}/api/player-finder-queue/cancel?requestId=${requestId}&userId=${userId}&comments=${encodeURIComponent(comment)}`;

        const response = await axios.get(cancelUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: '*/*',
          },
        });

        console.log('Cancel response:', response.data);
        setStatus('success');

        // ✅ trigger API refetch provided by caller
        refetch();

        return true;
      } catch (err: any) {
        console.log('Cancel error:', err);
        setError(err?.message || 'Unknown error');
        setStatus('error');
        return false;
      }
    },
    [refetch]
  );

  return {
    cancelInvitation,
    status,
    error,
  };
};
