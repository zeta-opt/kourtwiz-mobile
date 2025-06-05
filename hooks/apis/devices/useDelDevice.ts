import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useState } from 'react';

type DeleteDeviceParams = {
  deviceId: string;
  clubId: string;
};

export const useDeleteClubDevice = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const deleteDevice = async (
    { deviceId, clubId }: DeleteDeviceParams,
    callbacks?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ): Promise<void> => {
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      await axios.delete(`${BASE_URL}/api/devices/${deviceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      });

      setStatus('success');
      callbacks?.onSuccess?.();
    } catch (err: any) {
      setStatus('error');
      const errorMessage =
        err?.response?.data?.message || err.message || 'Unknown error';
      setError(errorMessage);
      callbacks?.onError?.(new Error(errorMessage));
    }
  };

  return { deleteDevice, status, error };
};
