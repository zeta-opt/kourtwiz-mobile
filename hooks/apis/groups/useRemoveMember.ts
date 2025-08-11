import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useState } from 'react';

type RemoveGroupMemberParams = {
  groupId: string;
  memberPhone: string;
  requesterUserId: string;
};

export const useRemoveGroupMember = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const removeMember = async (
    { groupId, memberPhone, requesterUserId }: RemoveGroupMemberParams,
    callbacks?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ): Promise<void> => {
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      const url = `${BASE_URL}/api/groups/${groupId}/members/${memberPhone}?requesterUserId=${requesterUserId}`;

      await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      });

      setStatus('success');
      callbacks?.onSuccess?.();
    } catch (err: any) {
      setStatus('error');
      const errorMessage =
        err?.response?.data?.message || err.message || 'Unknown error';
      setError(errorMessage);
      callbacks?.onError?.(new Error(errorMessage));
    }
  };

  return { removeMember, status, error };
};
