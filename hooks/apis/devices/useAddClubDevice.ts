import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useState } from 'react';


type DevicePayload = {
  name: string;
  type: 'CAMERA' | 'LIGHT' | 'SWITCH'; 
  status: string;
  clubId: string;
  courtId?: string;
  controlEndpoint?: string;
  metadata?: Record<string, string>;
};

export const useAddClubDevice = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const addDevice = async ({
    deviceData,
    callbacks,
  }: {
    deviceData: DevicePayload;
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
        `${BASE_URL}/api/devices`,
        deviceData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
        }
      );

      setStatus('success');
      callbacks?.onSuccess?.(response.data);
    } catch (err: any) {
      setStatus('error');
      console.log('Add device error:', err);
      const errorMessage =
        err?.response?.data?.message || err.message || 'Unknown error';
      setError(errorMessage);
      callbacks?.onError?.(new Error(errorMessage));
    }
  };

  return { addDevice, status, error };
};
