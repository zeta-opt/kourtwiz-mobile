import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';

export type UseGetUsersReturn = {
  data: Record<string, any>[] | null;
  status: 'loading' | 'error' | 'success';
  refetch: () => void;
};

export const useGetClubCourt = ({
  clubId,
}: {
  clubId: string;
}): UseGetUsersReturn => {
  const [data, setData] = useState<Record<string, any>[] | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading'
  );
  const [refetchState, setRefetchState] = useState(false);
  const refetch = () => {
    setRefetchState((prev) => !prev);
  };
  useEffect(() => {
    const fetchClubCourt = async (): Promise<void> => {
      setStatus('loading');
      try {
        const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
        const token = await getToken();

        const response = await axios.get(`${BASE_URL}/courts/club/${clubId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: '*/*',
          },
        });
        setData(response.data);
        setStatus('success');
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        setStatus('error');
      }
    };
    if (clubId) {
      fetchClubCourt();
    }
  }, [clubId, refetchState]);

  return {
    data,
    status,
    refetch,
  };
};

export default useGetClubCourt;
