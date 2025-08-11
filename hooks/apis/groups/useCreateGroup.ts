import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useState } from 'react';

type GroupPayload = {
    name: string;
    creatorUserId: string;
    members: { 
      name: string; 
      userId?: string; 
      phoneNumber: string; 
      admin: boolean 
    }[];
  };

export const useCreateGroup = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const createGroup = async ({
    groupData,
    callbacks,
  }: {
    groupData: GroupPayload;
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
        `${BASE_URL}/api/groups`,
        groupData,
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
      console.log('Create Group error:', err);
      const errorMessage =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.errors) && err.response.data.errors.join(', ')) ||
        err?.response?.data?.error ||
        err.message ||
        'Unknown error';
        
      setError(errorMessage);
      callbacks?.onError?.(new Error(errorMessage));
    }
  };

  return { createGroup, status, error };
};
