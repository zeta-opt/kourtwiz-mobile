import Constants from 'expo-constants';
import { useState } from 'react';
import axios from 'axios';

type ResetPayload = {
  email: string;
  otp: string;
  newPassword: string;
};

export const useResetPassword = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const resetPassword = async (
    payload: ResetPayload,
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

      const response = await axios.post(
        `${BASE_URL}/password/reset-password`,
        null, // no body; parameters go in query string
        {
          params: {
            email: payload.email.trim(),
            otp: payload.otp.trim(),
            newPassword: payload.newPassword,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setStatus('success');
      onSuccess?.(response.data);
    } catch (err: any) {
      setStatus('error');

      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Something went wrong';

      setError(errorMessage);

      // Debug logs
      // console.error('❌ Reset password failed');
      // console.error('Status:', err?.response?.status);
      // console.error('Response:', err?.response?.data);
      // console.error('Full error:', err);

      onError?.(err);
    }
  };

  return { resetPassword, status, error };
};
