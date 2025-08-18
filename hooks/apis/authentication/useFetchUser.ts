import { getToken } from '@/shared/helpers/storeToken';
import Constants from 'expo-constants';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login, setProfileImage } from '../../../store/authSlice';
import { useRouter } from 'expo-router';

export const useFetchUser = () => {
  const dispatch = useDispatch();
  const router = useRouter();
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
      
      if (!response.ok){ 
        router.replace('/login');
        throw new Error('Failed to fetch user data')
      };

      const userData = await response.json();
      dispatch(login({ user: userData, token }));

      const imageRes = await fetch(
        `${BASE_URL}/users/${userData.userId}/image`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (imageRes.ok) {
        const blob = await imageRes.blob();

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          dispatch(setProfileImage(base64data));
        };

        reader.readAsDataURL(blob);
      } else {
        console.warn('Could not fetch profile image');
      }

      setStatus('success');
    } catch (err: any) {
      console.error(err.message);
      setError(err.message);
      setStatus('error');
    }
  };

  return { fetchUser, status, error };
};
