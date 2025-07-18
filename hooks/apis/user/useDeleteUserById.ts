import { useState } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

export const useDeleteUserById = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  /**
   * @param userId - string
   * @param refetch - optional function to re-fetch user data after deletion
   */
  const deleteUserById = async (
    userId: string,
    refetch?: () => Promise<void>
  ) => {
    try {
      setStatus('loading');
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      const response = await axios.delete(`${BASE_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ User deleted:', response.data);
      if (refetch) await refetch();

      setStatus('success');
      return response.data;
    } catch (err: any) {
      console.error('❌ Delete error:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.message);
      setStatus('error');
      throw err;
    }
  };

  return { deleteUserById, status, error };
};
