import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useState } from 'react';

export const useRequestPlayerFinder = () => {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  const requestPlayerFinder = async ({
    finderData,
    callbacks,
  }: {
    finderData: any;
    callbacks?: {
      onSuccess?: (data: any) => void;
      onError?: (error: Error) => void;
    };
  }): Promise<void> => {
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();
      const response = await axios.post(
        `${BASE_URL}/api/player-finder-queue/request`,
        finderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
        }
      );
      setStatus('success');
      callbacks?.onSuccess?.(response);
    } catch (err: any) {
      setStatus('error');
      console.log(err);
      const errorMessage =
        err?.response?.data?.message || err.message || 'Unknown error';
      setError(errorMessage);
      console.log('error message ; ', errorMessage);
      const errorObj = new Error(errorMessage);
      callbacks?.onError?.(errorObj);
    }
  };

  return { requestPlayerFinder, status, error };
};
