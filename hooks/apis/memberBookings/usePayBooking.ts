// hooks/apis/memberBookings/usePayBooking.ts
import React from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

type PayBookingHook = {
  pay: (bookingId: string) => Promise<void>;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
};

export const usePayBooking = (): PayBookingHook => {
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = React.useState<string | null>(null);

  const pay = async (bookingId: string): Promise<void> => {
    setStatus('loading');
    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      await axios.put(
        `${BASE_URL}/api/bookings/booking/${bookingId}/pay`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setStatus('success');
    } catch (err: any) {
      console.error('Failed to pay for booking:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  return { pay, status, error };
};
