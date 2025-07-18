import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';

type UseGetUserDetailsReturn = {
  data: any | null;
  preferredPlayers: string[] | null;
  status: 'loading' | 'error' | 'success' | 'idle';
  refetch: () => void;
};

export const useGetUserDetails = ({
  userId,
  enabled = true,
}: {
  userId: string;
  enabled?: boolean;
}): UseGetUserDetailsReturn => {
  const [data, setData] = useState<any | null>(null);
  const [preferredPlayers, setPreferredPlayers] = useState<string[] | null>(
    null
  );
  const [status, setStatus] = useState<
    'loading' | 'error' | 'success' | 'idle'
  >('idle');
  const [refetchState, setRefetchState] = useState(false);

  const refetch = () => {
    setRefetchState((prev) => !prev);
  };

  useEffect(() => {
    const fetchUserDetails = async (): Promise<void> => {
      if (!enabled) {
        setStatus('idle');
        return;
      }

      setStatus('loading');
      try {
        const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
        const token = await getToken();
        const response = await axios.get(`${BASE_URL}/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: '*/*',
          },
        });

        setData(response.data);
        // Extract preferToPlayWith from playerDetails
        const players = response.data?.playerDetails?.preferToPlayWith || [];
        setPreferredPlayers(players);
        setStatus('success');
      } catch (error) {
        console.error('Failed to fetch user details:', error);
        setStatus('error');
      }
    };

    if (userId && enabled) {
      fetchUserDetails();
    }
  }, [userId, enabled, refetchState]);

  return {
    data,
    preferredPlayers,
    status,
    refetch,
  };
};
