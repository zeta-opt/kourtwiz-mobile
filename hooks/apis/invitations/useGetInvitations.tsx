import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';

type UseGetUsersReturn = {
  data: Record<string, any>[] | null;
  status: 'loading' | 'error' | 'success';
  refetch: () => void;
};

export const useGetInvitations = ({
  userId,
}: {
  userId: string;
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
    const fetchInvites = async (): Promise<void> => {
      console.log('user ID : ', userId);
      setStatus('loading');
      try {
        const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
        const token = await getToken();
        const response = await axios.get(
          `${BASE_URL}/api/player-tracker/tracker/user?userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: '*/*',
            },
          }
        );
        setData(response.data);
        setStatus('success');
      } catch (error) {
        console.error('Failed to invitees:', error);
        setStatus('error');
      }
    };
    if (userId) {
      fetchInvites();
    }
  }, [userId, refetchState]);

  return {
    data,
    status,
    refetch,
  };
};
