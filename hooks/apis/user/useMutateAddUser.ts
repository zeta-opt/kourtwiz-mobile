import Constants from 'expo-constants';
import { useState } from 'react';

export const useMutateAddUser = () => {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  const addUser = async ({
    payload,
    callbacks,
  }: {
    payload: any;
    callbacks?: {
      onSuccess?: (data: any) => void;
      onError?: (error: Error) => void;
    };
  }): Promise<void> => {
    setStatus('loading');
    setError(null);

    const { membershipTypeId, file, ...userJsonFields } = payload;
    const formData = new FormData();
    formData.append('UserJson', JSON.stringify(userJsonFields));

    if (file) {
      formData.append('file', file);
    }

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

      const response = await fetch(
        `${BASE_URL}/users/assign-club-membership/${payload.currentActiveClubId}?membershipTypeId=${membershipTypeId}`,
        {
          method: 'POST',
          body: formData,
        }
      );
      setStatus('success');
      callbacks?.onSuccess?.(response);
    } catch (err: any) {
      setStatus('error');
      console.log(err);
      const errorMessage =
        err?.response?.data?.message || err.message || 'Unknown error';
      setError(errorMessage);
      console.log('error message ; ', errorMessage);
      const errorObj = new Error(errorMessage);
      callbacks?.onError?.(errorObj);
    }
  };

  return { addUser, status, error };
};
