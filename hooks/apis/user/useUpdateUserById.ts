import { useState } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

export const useUpdateUserById = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const updateUserById = async (userId: string, userData: any) => {
    try {
      setStatus('loading');
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      const { email, phoneNumber, ...safeUserData } = userData;

      const response = await axios.put(
        `${BASE_URL}/users/${userId}`,
        safeUserData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ User updated:', response.data);
      setStatus('success');
      return response.data;
    } catch (err: any) {
      console.error('❌ Update error:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.message);
      setStatus('error');
      throw err;
    }
  };

  return { updateUserById, status, error };
};
