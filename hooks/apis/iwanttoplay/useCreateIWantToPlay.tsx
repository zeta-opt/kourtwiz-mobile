import axios from 'axios';
import Constants from 'expo-constants';
import { useState } from 'react';
import { getToken } from '@/shared/helpers/storeToken';

const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

export const useCreateIWantToPlay = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const createIWantToPlay = async ({
    userId,
    skillLevel,
    currentLocation,
    message,
    callbacks,
  }: {
    userId: string;
    skillLevel: number;
    currentLocation: string;
    message: string;
    callbacks?: {
      onSuccess?: (data: any) => void;
      onError?: (error: Error) => void;
    };
  }) => {
    setStatus('loading');
    setError(null);

    try {
      const token = await getToken();

      const payload = {
        userId,
        skillLevel,
        currentLocation: currentLocation.trim(),
        message: message.trim(),
      };

      const response = await axios.post(`${BASE_URL}/api/iwanttoplay/create`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setStatus('success');
      callbacks?.onSuccess?.(response.data);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err.message || 'Failed to create IWantToPlay entry';
      setStatus('error');
      setError(errorMessage);
      callbacks?.onError?.(new Error(errorMessage));
      throw new Error(errorMessage);
    }
  };

  return { createIWantToPlay, status, error };
};
