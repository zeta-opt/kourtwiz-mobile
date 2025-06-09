import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';

export const fetchCoaches = async (clubId: string) => {
  if (!clubId) throw new Error('Club ID is required');

  const token = await getToken();
  const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
  const response = await axios.get(
    `${BASE_URL}/api/clubs/${clubId}/coaches`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
