import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('vedetteAuthToken', token);
  } catch (e) {
    console.error('Failed to save token', e);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('vedetteAuthToken');
  } catch (e) {
    console.error('Failed to fetch token', e);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('vedetteAuthToken');
  } catch (e) {
    console.error('Failed to remove token', e);
  }
};
