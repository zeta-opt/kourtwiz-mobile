import React from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

interface GuestFormData {
  name: string;
  email: string;
  phoneNumber: string;
  whoseGuest: string;
  bookingId: string;
}

export const useAddGuest = (onSuccessCallback: () => void) => {
  const [isAddingGuest, setIsAddingGuest] = React.useState(false);

  const addGuest = async (guestData: GuestFormData) => {
    try {
      setIsAddingGuest(true);
      const token = await getToken();
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

      const response = await axios.post(`${BASE_URL}/api/guest-list`, guestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        alert(response.data || 'Guest added successfully');
        onSuccessCallback();
      }
    } catch (error: any) {
      console.error('Add Guest failed:', error);
      alert(
        error?.response?.data?.message ||
        error.message ||
        'An unknown error occurred while adding guest'
      );
    } finally {
      setIsAddingGuest(false);
    }
  };

  return { addGuest, isAddingGuest };
};
