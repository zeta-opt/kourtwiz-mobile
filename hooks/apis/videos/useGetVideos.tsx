import { getToken } from '@/shared/helpers/storeToken';
import axios, { isAxiosError } from 'axios';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';

interface VideoResponse {
  presignedUrl: string;
  id: string;
  eventName: string;
  location: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export const useGetVideos = (userId: string) => {
  const [videos, setVideos] = useState<VideoResponse[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async (): Promise<void> => {
    try {
      setStatus('loading');
      setError(null);

      const BASE_URL = Constants.expoConfig?.extra?.apiUrl || '';
      const token = await getToken();

      console.log('Fetching videos for userId:', userId);
      console.log('BASE_URL:', BASE_URL);
      console.log('Token exists:', !!token);

      if (!token) {
        throw new Error('No token found');
      }

      const url = `${BASE_URL}/api/videos/user/videosURL/${userId}`;
      console.log('Fetching from URL:', url);

      const response = await axios.get<VideoResponse[]>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: '*/*',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Is array:', Array.isArray(response.data));

      setVideos(response.data);
      setStatus('success');
    } catch (err) {
      console.error('Error fetching videos:', err);
      setStatus('error');
      if (isAxiosError(err)) {
        console.error('Axios error response:', err.response?.data);
        console.error('Axios error status:', err.response?.status);
        setError(
          err.response?.data?.message || err.message || 'Failed to fetch videos'
        );
      } else {
        setError('An unexpected error occurred');
      }
      setVideos([]);
    }
  };

  const refetchVideos = async (): Promise<void> => {
    await fetchVideos();
  };

  const resetStatus = () => {
    setStatus('idle');
    setError(null);
  };

  useEffect(() => {
    if (userId) {
      fetchVideos();
    }
  }, [userId]);

  return {
    videos,
    status,
    error,
    refetchVideos,
    resetStatus,
  };
};
