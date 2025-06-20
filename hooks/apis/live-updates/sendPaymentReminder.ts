import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

const sendPaymentReminder = async (bookingId: string): Promise<void> => {
  try {
    const token = await getToken();

    const response = await axios.post(
      `${BASE_URL}/api/bookings/remind-payment/${bookingId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: '*/*',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Error sending payment reminder:', error);
    throw error;
  }
};

export default sendPaymentReminder;
