import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useState, useEffect } from 'react';

type Comment = {
  id: string;
  userId: string;
  userName: string;
  commentText: string;
  imageUrl?: string;
};

type UseGetCommentsReturn = {
  data: Comment[] | null;
  status: 'loading' | 'error' | 'success';
  refetch: () => void;
};

export const useGetComments = (requestId: string): UseGetCommentsReturn => {
  const [data, setData] = useState<Comment[] | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [refetchToggle, setRefetchToggle] = useState(false);

  const refetch = () => setRefetchToggle((prev) => !prev);

  useEffect(() => {
    if (!requestId) return;

    const fetchComments = async () => {
      setStatus('loading');
      try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();
        const response = await axios.get(
          `${BASE_URL}/api/player-finder/comments/request/${requestId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        setData(response.data);
        setStatus('success');
      } catch (error) {
        console.error('Error fetching comments:', error);
        setStatus('error');
      }
    };

    fetchComments();
  }, [requestId, refetchToggle]);

  return { data, status, refetch };
};
