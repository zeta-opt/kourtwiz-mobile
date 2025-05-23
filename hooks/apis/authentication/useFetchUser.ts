import { getToken } from '@/shared/helpers/storeToken';
import Constants from 'expo-constants';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../../../store/authSlice'; // path may vary

export const useFetchUser = () => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (): Promise<void> => {
    try {
      setStatus('loading');
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();
      const response = await fetch(`${BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch user data');

      const userData = await response.json();
      dispatch(login(userData));
      setStatus('success');
    } catch (err: any) {
      console.error(err.message);
      setError(err.message);
      setStatus('error');
    }
  };

  return { fetchUser, status, error };
};
