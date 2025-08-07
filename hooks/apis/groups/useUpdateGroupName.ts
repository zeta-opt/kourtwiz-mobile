import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

export const useUpdateGroupName = () => {
  const updateGroupName = async ({
    groupId,
    requesterUserId,
    newName,
  }: {
    groupId: string;
    requesterUserId: string;
    newName: string;
  }) => {
    const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
    const token = await getToken();

    const url = `${BASE_URL}/api/groups/${groupId}/update-name?requesterUserId=${requesterUserId}&newName=${newName}`;

    return axios.put(url, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  };

  return { updateGroupName };
};
