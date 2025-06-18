import { useState } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

interface ActivateEntryModeData {
  bookingId: string;
}

export function useActivateEntryMode(onSuccessCallback?: () => void) {
  const [isActivating, setIsActivating] = useState(false);

  const activateEntryMode = async ({ bookingId }: ActivateEntryModeData) => {
    try {
      setIsActivating(true);
      const token = await getToken();
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

      const response = await axios.put(
        `${BASE_URL}/api/bookings/activate-entry-mode`,
        {},
        {
          params: { bookingId },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
        }
      );

      const message = response.data?.message || 'Entry mode activated successfully';
      alert(message);
      onSuccessCallback?.();
    } catch (error: any) {
      alert(`Activate Entry Mode failed: ${error.message || 'An unknown error occurred'}`);
    } finally {
      setIsActivating(false);
    }
  };

  return { activateEntryMode, isActivating };
}
