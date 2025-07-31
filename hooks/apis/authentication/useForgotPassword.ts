import Constants from 'expo-constants';
import { useState } from 'react';
import axios from 'axios';

export const useForgotPassword = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const forgotPassword = async (
    email: string,
    {
      onSuccess,
      onError,
    }: {
      onSuccess?: (resData: any) => void;
      onError?: (err: any) => void;
    } = {}
  ) => {
    try {
      setStatus('loading');
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

      const response = await axios.post(`${BASE_URL}/password/forgot-password`, null, {
        params: { email },
      });

      setStatus('success');
      onSuccess?.(response.data);
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
       console.log('Forgot password failed:', err);
      onError?.(err);
    }
  };

  return { forgotPassword, status, error };
};
