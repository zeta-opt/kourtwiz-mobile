import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useState, useEffect } from 'react';

type Comment = {
  id: string;
  requestId: string;
  eventType: string;      // e.g. "iwanttoplay", "group", "event", etc.
  eventName: string;
  placeToPlay: string;
  groupName: string;
  joined: boolean;        // whether the user has joined (important for iwanttoplay)
  userId: string;
  userName: string;
  commentText: string;
  image?: string;
  timestamp: string;      // ISO string
  edited: boolean;
  editedAt?: string;
};


type UseGetAllCommentsReturn = {
  data: Comment[] | null;
  status: 'loading' | 'error' | 'success';
  refetch: () => void;
};

export const useGetAllComments = ({
  userId,
}: {
  userId: string;
}): UseGetAllCommentsReturn => {
  const [data, setData] = useState<Comment[] | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [refetchToggle, setRefetchToggle] = useState(false);
  const refetch = () => setRefetchToggle((prev) => !prev);

  useEffect(() => {
    const fetchAllComments = async () => {
      setStatus('loading');
      try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();
        const response = await axios.get(
          `${BASE_URL}/api/player-finder/comments/user/${userId}`,
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

    fetchAllComments();
  }, [userId, refetchToggle]);

  return { data, status, refetch };
};
