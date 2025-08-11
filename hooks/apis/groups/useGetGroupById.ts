import { useState } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

export const useGetGroupById = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const getGroup = async ({
    groupId,
    callbacks,
  }: {
    groupId: string;
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

      const response = await axios.get(`${BASE_URL}/api/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: '*/*',
        },
      });

      setData(response.data);
      setStatus('success');
      callbacks?.onSuccess?.(response.data);
    } catch (err: any) {
      setStatus('error');
      const errorMessage =
        err?.response?.data?.message || err.message || 'Unknown error';
      setError(errorMessage);
      callbacks?.onError?.(new Error(errorMessage));
    }
  };

  return { getGroup, status, error, data };
};
