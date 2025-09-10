import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useCallback, useState } from 'react';

type UpdateEventPayload = {
  placeToPlay?: string;
  playTime?: string;
  playEndTime?: string;
  playersNeeded?: number;
  skillLevel?: string;
};

type UseUpdatePlayerFinderEventReturn = {
  updateEvent: (
    requestId: string,
    requesterId: string,
    payload: UpdateEventPayload
  ) => Promise<boolean>;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
};

export const useUpdatePlayerFinderEvent = (
  refetch: () => void
): UseUpdatePlayerFinderEventReturn => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const updateEvent = useCallback(
    async (
      requestId: string,
      requesterId: string,
      payload: UpdateEventPayload
    ): Promise<boolean> => {
      setStatus('loading');
      setError(null);

      try {
        const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
        const token = await getToken();

        const updateUrl = `${BASE_URL}/api/player-finder-queue/update/player-finder-event/${requestId}?requesterId=${requesterId}`;

        const response = await axios.put(updateUrl, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: '*/*',
            'Content-Type': 'application/json',
          },
        });

        console.log('Update event response:', response.data);
        setStatus('success');

        // ✅ trigger refetch after update
        refetch();

        return true;
      } catch (err: any) {
        console.log('Update event error:', err);
        setError(err?.message || 'Unknown error');
        setStatus('error');
        return false;
      }
    },
    [refetch]
  );

  return {
    updateEvent,
    status,
    error,
  };
};
