import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Invite } from '@/components/home-page/outgoingInvitationsCard';

type UseGetUsersReturn = {
  data: Invite[] | null;
  status: 'loading' | 'error' | 'success';
  refetch: () => void;
};

type Props = {
  inviteeEmail: string;
};

export const useGetPlayerInvitationSent = ({
  inviteeEmail,
}: Props): UseGetUsersReturn => {
  const [data, setData] = useState<Invite[] | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [refetchState, setRefetchState] = useState(false);

  const refetch = () => {
    setRefetchState((prev) => !prev);
  };
  
  useEffect(() => {
    const fetchClubCourt = async (): Promise<void> => {
      setStatus('loading');
      try {
        console.log('invitee email : ', inviteeEmail);
        const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
        const token = await getToken();
        const response = await axios.get(
          `${BASE_URL}/api/player-tracker/tracker/invitee?inviteeEmail=${encodeURIComponent(
            inviteeEmail
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: '*/*',
            },
          }
        );
        setData(response.data);
        setStatus('success');
      } catch (error) {
        console.error('Failed to invitees:', error);
        setStatus('error');
      }
    };
    if (inviteeEmail) {
      fetchClubCourt();
    }
  }, [inviteeEmail, refetchState]);

  return {
    data,
    status,
    refetch,
  };
};
