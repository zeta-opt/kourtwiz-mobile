import React from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

export const usePayGuest = () => {
  const [isPayingGuest, setIsPayingGuest] = React.useState(false);
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const payGuest = async (bookingId: string): Promise<{ success: boolean; message?: string }> => {
    if (!bookingId) {
      setStatus('error');
      return { success: false, message: 'Booking ID is required' };
    }

    try {
      setIsPayingGuest(true);
      setStatus('loading');
      const token = await getToken();
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

      const response = await axios.put(
        `${BASE_URL}/api/guest-list/payforguests`,
        {},
        {
          params: { bookingId },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setStatus('success');
        return { success: true, message: response.data || 'Guest payment successful' };
      } else {
        setStatus('error');
        return { success: false, message: 'Unexpected server response' };
      }
    } catch (error: any) {
      console.error('Guest Payment failed:', error);
      setStatus('error');
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error.message ||
          'An unknown error occurred while paying for guests',
      };
    } finally {
      setIsPayingGuest(false);
    }
  };

  return { payGuest, isPayingGuest, status };
};
