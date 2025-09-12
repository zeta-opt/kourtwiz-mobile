import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

const API_URL = 'https://api.vddette.com';

export interface PlayerFinderRequest {
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

export const useGetPlayerFinderRequest = (requestId: string | undefined) => {
  const [data, setData] = useState<PlayerFinderRequest[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ make fetchRequest reusable with useCallback
  const fetchRequest = useCallback(async () => {
    if (!requestId) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      console.log('Fetching player finder request with ID:', requestId);
      console.log('Using token:', token);

      const response = await axios.get(
        `${API_URL}/api/player-tracker/tracker/request`,
        {
          params: { requestId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Full API response:', response.data);
      setData(response.data);
    } catch (err: any) {
      console.error('Failed to fetch player finder request:', err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Failed to fetch request details'
      );
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  // run automatically when requestId changes
  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  // ✅ expose refetch like useCancelInvitation
  return { data, loading, error, refetch: fetchRequest };
};
