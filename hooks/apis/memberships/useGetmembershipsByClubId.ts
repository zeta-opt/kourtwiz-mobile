import axios from 'axios';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';

export const useGetMembershipsByClubId = (clubId: string) => {
  const [data, setData] = useState<Record<string, any>[] | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading'
  );

  useEffect(() => {
    const fetchMemberships = async (): Promise<void> => {
      setStatus('loading');
      try {
        const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
        const response = await axios.get(
          `${BASE_URL}/api/membership-plans/${clubId}`,
          {
            headers: {
              Accept: '*/*',
            },
          }
        );
        setData(response.data);
        setStatus('success');
      } catch (error) {
        console.error('Failed to fetch membership plans:', error);
        setStatus('error');
      }
    };

    if (clubId) {
      fetchMemberships();
    }
  }, [clubId]);

  return { data, status };
};
