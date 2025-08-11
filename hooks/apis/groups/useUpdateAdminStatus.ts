import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';

export const useUpdateGroupAdminStatus = () => {
  const updateAdminStatus = async ({
    groupId,
    requesterUserId,
    targetPhone,
    makeAdmin,
  }: {
    groupId: string;
    requesterUserId: string;
    targetPhone: string;
    makeAdmin: boolean;
  }) => {
    const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
    const token = await getToken();
    
    const url = `${BASE_URL}/api/groups/${groupId}/admin-status`;
    
    console.log("Calling updateAdminStatus with URL:", url);

    try {
      const response = await axios.put(
        url,
        {}, // optional request body, can be {} or null if not needed
        {
          params: {
            requesterUserId,
            targetPhone,
            makeAdmin,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: '*/*',
          },
        }
      );

      console.log("Response status:", response.status, "data:", response.data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Unknown error';
      console.error("Admin update failed:", message);
      throw new Error(message);
    }
  };

  return { updateAdminStatus };
};
