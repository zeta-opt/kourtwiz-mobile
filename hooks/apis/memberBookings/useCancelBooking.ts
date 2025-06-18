// hooks/apis/memberBookings/useCancelBooking.ts
import React from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

type CancelBookingHook = {
  cancel: (bookingId: string) => Promise<void>;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
};

export const useCancelBooking = (): CancelBookingHook => {
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = React.useState<string | null>(null);

  const cancel = async (bookingId: string): Promise<void> => {
    setStatus('loading');
    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      await axios.delete(`${BASE_URL}/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setStatus('success');
    } catch (err: any) {
      console.error('Failed to cancel booking:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  return { cancel, status, error };
};
