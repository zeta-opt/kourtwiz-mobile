import { useEffect, useState } from 'react';
import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';

type UseGetSessionsReturn = {
  data: any[] | null;
  status: 'loading' | 'error' | 'success';
  refetch: () => void;
};

const useGetOpenPlaySessions = (clubId: string): UseGetSessionsReturn => {
  
  const [data, setData] = useState<any[] | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [refetchState, setRefetchState] = useState(false);

  const refetch = () => setRefetchState((prev) => !prev);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setStatus('loading');
        const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
        const token = await getToken();
        const res = await axios.get(`${BASE_URL}/api/play-type/sessions/available?clubId=${clubId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: '*/*',
          },
        });
        setData([...res.data]);
        setStatus('success');
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setStatus('error');
      }
    };

    if (clubId) fetchSessions();
  }, [clubId, refetchState]);

  return { data, status, refetch };
};
export default useGetOpenPlaySessions;