import { useState } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

type GroupMemberPayload = {
  name: string;
  phoneNumber: string;
};

export const useAddGroupMember = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const addMember = async ({
    groupId,
    requesterUserId,
    memberData,
    callbacks,
  }: {
    groupId: string;
    requesterUserId: string;
    memberData: GroupMemberPayload;
    callbacks?: {
      onSuccess?: (data: any) => void;
      onError?: (error: Error) => void;
    };
  }): Promise<void> => {
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      const response = await axios.put(
        `${BASE_URL}/api/groups/${groupId}/update-members?requesterUserId=${requesterUserId}`,
        memberData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
        }
      );

      setStatus('success');
      callbacks?.onSuccess?.(response.data);
    } catch (err: any) {
      setStatus('error');
      const errorMessage =
        err?.response?.data?.message || err.message || 'Unknown error';
      setError(errorMessage);
      callbacks?.onError?.(new Error(errorMessage));
    }
  };

  return { addMember, status, error };
};
