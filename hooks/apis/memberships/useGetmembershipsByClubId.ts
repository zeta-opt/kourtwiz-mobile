import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useCallback, useEffect, useState } from 'react';

interface MembershipPlan {
  id: string;
  clubId: string;
  name: string;
  price: number;
  duration: string;
  perks?: Record<string, any>;
  customPerks?: Record<string, any>;
}

export const useGetMembershipsByClubId = (clubId: string) => {
  const [data, setData] = useState<MembershipPlan[] | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [error, setError] = useState<string | null>(null);

  const fetchMemberships = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      const response = await axios.get(`${BASE_URL}/api/membership-plans/${clubId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: '*/*',
        },
      });

      setData(response.data);
      setStatus('success');
    } catch (err: any) {
      console.error('Failed to fetch membership plans:', err);
      const errorMessage = err?.response?.data?.message || err.message || 'Something went wrong';
      setError(errorMessage);
      setStatus('error');
    }
  }, [clubId]);

  useEffect(() => {
    if (clubId) {
      fetchMemberships();
    }
  }, [clubId, fetchMemberships]);

  return {
    data,
    status,
    error,
    refetch: fetchMemberships,
  };
};
