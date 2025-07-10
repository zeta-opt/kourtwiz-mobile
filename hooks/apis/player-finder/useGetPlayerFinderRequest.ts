import { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '@/shared/helpers/storeToken';

const API_URL = 'http://44.216.113.234:8080'; 

interface PlayerFinderRequest {
  id: string;
  requestId: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  inviteeName: string;
  inviteeEmail: string;
  skillRating: number;
  acceptUrl: string;
  declineUrl: string;
  playTime: number[];
  playEndTime: number[];
  status: string;
  responseAt: string | null;
  placeToPlay: string;
  comments: string | null;
  commentByRequestor: string | null;
  playersNeeded: number;
  reminderMetadata: {
    invitationSentAt: number[];
    lastReminderSentAt: number[] | null;
    nextReminderAt: number[];
    totalTimeBeforePlay: number;
    reminderStartOffsetMinutes: number;
    reminderIntervalMinutes: number;
    cancelThresholdMinutes: number;
  };
}

export const useGetPlayerFinderRequest = (
  requestId: string | undefined,
  currentUserId: string | undefined
) => {
  const [data, setData] = useState<PlayerFinderRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId || !currentUserId) return;

    const fetchRequest = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        console.log('Fetching player finder request with ID:', requestId);
        console.log('Using userId:', currentUserId);
        console.log('Using token:', token);

        const response = await axios.get(`${API_URL}/api/player-tracker/tracker/request`, {
          params: { requestId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Full API response:', response.data);

        const playerData = response.data.find(
          (entry: PlayerFinderRequest) => entry.userId === currentUserId
        );

        if (!playerData) {
          throw new Error('You are not invited in this request.');
        }

        setData(playerData);
        console.log('Fetched player finder request:', playerData);
      } catch (err: any) {
        console.error('Failed to fetch player finder request:', err);
        setError(err?.response?.data?.message || err.message || 'Failed to fetch request details');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [requestId, currentUserId]);

  return { data, loading, error };
};
