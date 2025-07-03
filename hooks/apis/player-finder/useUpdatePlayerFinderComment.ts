import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';

type UpdateCommentPayload = {
  commentText: string;
};

export const updateComment = async (
  commentId: string,
  payload: UpdateCommentPayload
): Promise<void> => {
  const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
  const token = await getToken();

  await axios.put(`${BASE_URL}/api/player-finder/comments/${commentId}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
};
