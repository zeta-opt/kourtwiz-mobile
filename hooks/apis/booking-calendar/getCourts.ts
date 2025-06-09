import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';

export const fetchCourts = async (clubId: string) => {
  if (!clubId) throw new Error('Club ID is required');

  const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
  const token = await getToken();
  const response = await axios.get(
      `${BASE_URL}/courts/club/${clubId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.map((court: any) => ({ id: court.id, title: court.name }));
};
