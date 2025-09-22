import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';

type Notification = {
  id: string;
  title: string;
  body: string;
  date: string;
};

type NotificationsList = {
  data: Notification[] | null;
  status: 'loading' | 'error' | 'success';
  refetch: () => void;
};

type UnreadCount = {
  count: number;
  status: 'loading' | 'error' | 'success';
  refetch: () => void;
};

// Hook to get unread count
export function useGetUnreadCount(userId: string): UnreadCount {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading'
  );
  const [refetchState, setRefetchState] = useState(false);

  const refetch = () => setRefetchState((prev) => !prev);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      setStatus('loading');
      try {
        const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
        const token = await getToken();

        const response = await axios.get<number>(
          `${BASE_URL}/notifications/${userId}/unread-count`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              Accept: '*/*',
            },
          }
        );
        setCount(response.data);
        setStatus('success');
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
        setStatus('error');
      }
    };

    if (userId) {
      fetchUnreadCount();
    }
  }, [userId, refetchState]);

  return { count, status, refetch };
}

// Hook to get notifications list
export function useGetNotifications(userId: string): NotificationsList {
  const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

  const [data, setData] = useState<Notification[] | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading'
  );
  const [refetchState, setRefetchState] = useState(false);

  const refetch = () => setRefetchState((prev) => !prev);
  console.log(`${BASE_URL}/notifications/${userId}`, 'url');

  useEffect(() => {
    const fetchNotifications = async () => {
      setStatus('loading');
      try {
        const token = await getToken();

        // Here you can safely call setData
        const response = await axios.get<Notification[]>(
          `${BASE_URL}/notifications/${userId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              Accept: '*/*',
            },
          }
        );
        setData(response.data || []);
        setStatus('success');
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setStatus('error');
      }
    };

    if (userId) fetchNotifications();
  }, [userId, refetchState]);

  return { data, status, refetch };
}

// Hook to mark notifications as read
export function useMarkAsRead(userId: string) {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'error' | 'success'
  >('idle');

  const markAsRead = async () => {
    setStatus('loading');
    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      await axios.put(
        `${BASE_URL}/notifications/${userId}/mark-as-read`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Accept: '*/*',
          },
        }
      );
      setStatus('success');
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      setStatus('error');
    }
  };

  return { markAsRead, status };
}
