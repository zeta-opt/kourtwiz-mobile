import axios from 'axios';
import Constants from 'expo-constants';
import { useState } from 'react';

type Credentials = {
  username: string;
  password: string;
};

type UseLoginUserReturn = {
  login: (
    credentials: Credentials,
    callbacks?: {
      onSuccess?: (data: any) => void;
      onError?: (error: Error) => void;
    }
  ) => Promise<void>;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
};

export const useLoginUser = (): UseLoginUserReturn => {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  const login = async (
    credentials: Credentials,
    callbacks?: {
      onSuccess?: (data: any) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<void> => {
    setStatus('loading');
    setError(null);
    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const response = await axios.post(`${BASE_URL}/auth/login`, credentials, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setStatus('success');
      callbacks?.onSuccess?.(response.data);
      return response.data;
    } catch (err: any) {
      setStatus('error');
      console.log(err);
      const errorMessage =
        err?.response?.data?.message || err.message || 'Unknown error';
      setError(errorMessage);
      console.log('error message : ', errorMessage);
      const errorObj = new Error(errorMessage);
      callbacks?.onError?.(errorObj);
    }
  };

  return { login, status, error };
};
