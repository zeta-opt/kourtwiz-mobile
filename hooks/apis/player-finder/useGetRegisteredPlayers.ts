import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';

type Player = {
  id: string;
  name: string;
  phoneNumber: string;
  // Add other fields as needed
};

type UseGetRegisteredPlayersReturn = {
  data: Player[] | null;
  status: 'loading' | 'error' | 'success' | 'idle';
  hasMore: boolean;
  page: number;
  loadMore: () => void;
  refetch: () => void;
};

export const useGetRegisteredPlayers = ({
  size = 20,
  enabled = true,
}: {
  size?: number;
  enabled?: boolean;
}): UseGetRegisteredPlayersReturn => {
  const [data, setData] = useState<Player[] | null>(null);
  const [status, setStatus] = useState<
    'loading' | 'error' | 'success' | 'idle'
  >('idle');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refetchState, setRefetchState] = useState(false);

  const refetch = () => {
    setData(null);
    setPage(0);
    setHasMore(true);
    setRefetchState((prev) => !prev);
  };

  const loadMore = () => {
    if (hasMore && status !== 'loading') {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const fetchRegisteredPlayers = async (): Promise<void> => {
      if (!enabled) {
        setStatus('idle');
        return;
      }

      setStatus('loading');
      try {
        const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
        const token = await getToken();
        const response = await axios.get(`${BASE_URL}/users/namesphonenos`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: '*/*',
          },
          params: {
            page,
            size,
          },
        });

        const newData = response.data.content || response.data || [];

        if (page === 0) {
          setData(newData);
        } else {
          setData((prev) => [...(prev || []), ...newData]);
        }

        // Check if there are more pages
        const totalElements = response.data.totalElements || 0;
        const currentTotal = (data?.length || 0) + newData.length;
        setHasMore(currentTotal < totalElements || newData.length === size);

        setStatus('success');
      } catch (error) {
        console.error('Failed to fetch registered players:', error);
        setStatus('error');
      }
    };

    if (enabled) {
      fetchRegisteredPlayers();
    }
  }, [page, size, enabled, refetchState]);

  return {
    data,
    status,
    hasMore,
    page,
    loadMore,
    refetch,
  };
};
