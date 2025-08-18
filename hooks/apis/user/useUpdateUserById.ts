import { useState } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

export const useUpdateUserById = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  /**
   * @param userId - string
   * @param userData - updated user fields
   * @param refetch - optional function to re-fetch user data after update
   */
  const updateUserById = async (
    userId: string,
    userData: any,
    refetch?: () => Promise<void> // <-- refetch callback
  ) => {
    try {
      setStatus('loading');
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      const response = await axios.put(
        `${BASE_URL}/users/${userId}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ User updated:', response.data);
      if (refetch) {
        await refetch();
      }

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
