import axios from 'axios';
import Constants from 'expo-constants';
import { useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
 
type Credentials = {
  username: string;
  password: string;
  userId: string; // <- you’ll need to pass this from your login form or Redux
};
 
type UseLoginUserReturn = {
  login: (
    credentials: Credentials,
    callbacks?: {
      onSuccess?: (data: any) => void;
      onError?: (error: Error) => void;
    }
  ) => Promise<void>;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
};
 
export const useLoginUser = (): UseLoginUserReturn => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
 
  const getDeviceToken = async () => {
    if (!Device.isDevice) return null;
 
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;
 
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  };
  
 
  const login = async (
    credentials: Credentials,
    callbacks?: {
      onSuccess?: (data: any) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<void> => {
    setStatus('loading');
    setError(null);
 
    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const deviceToken = await getDeviceToken();
      console.log("device token",deviceToken)
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
 
      const payload = {
        username: credentials.username,
        password: credentials.password,
        ...(deviceToken && {
        deviceRegisterRequest: {
          userId: credentials.userId,
          deviceToken,
          platform,
        }
        })
      };
 
      const response = await axios.post(`${BASE_URL}/auth/login`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
 
      setStatus('success');
      callbacks?.onSuccess?.(response.data);
      return response.data;
    } catch (err: any) {
      setStatus('error');
      const errorMessage = err?.response?.data?.message || err.message || 'Unknown error';
      setError(errorMessage);
      callbacks?.onError?.(new Error(errorMessage));
    }
  };
 
  return { login, status, error };
};