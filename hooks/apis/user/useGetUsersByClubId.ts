import { getToken } from '@/shared/helpers/storeToken';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';

export type UseGetUsersReturn = {
  data: Record<string, any>[] | null;
  status: 'loading' | 'error' | 'success';
  refetch: () => void;
};

export const useGetUsersByclubId = ({
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
    const fetchUsersByClubId = async (): Promise<void> => {
      setStatus('loading');
      try {
        const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
        const token = await getToken();
        const response = await fetch(
          `${BASE_URL}/user-club-roles/club/${clubId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch user data');
        const jsondata = await response.json();
        setData(jsondata);
        setStatus('success');
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        setStatus('error');
      }
    };
    if (clubId) {
      fetchUsersByClubId();
    }
  }, [clubId, refetchState]);

  return {
    data,
    status,
    refetch,
  };
};

export default useGetUsersByclubId;
