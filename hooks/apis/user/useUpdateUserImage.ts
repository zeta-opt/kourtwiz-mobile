import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

export const updateUserImage = async (userId: string, imageUri: string) => {
  try {
    const token = await getToken();
    const formData = new FormData();

    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg', // or detect the correct type
      name: 'profile.jpg',
    } as any);

    const res = await axios.put(
      `${Constants.expoConfig?.extra?.apiUrl}/users/${userId}/image`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return res.data;
  } catch (err) {
    console.error('Error updating user image:', err);
    throw err;
  }
};
