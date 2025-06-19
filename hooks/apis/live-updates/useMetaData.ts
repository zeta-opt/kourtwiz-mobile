import { useEffect, useState } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';

export function useMetaData(clubId: string) {
  const [courtMap, setCourtMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
        const token = await getToken();

        const response = await axios.get(`${BASE_URL}/courts/club/${clubId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: '*/*',
          },
        });

        const courtsData = response.data;
        const courtMap = Object.fromEntries(courtsData.map((c: any) => [c.id, c.name]));

        setCourtMap(courtMap);
      } catch (err) {
        console.error('❌ Error fetching court metadata:', err);
      } finally {
        setLoading(false);
      }
    };

    if (clubId) fetchMeta();
  }, [clubId]);

  return { courtMap, loading };
}

export default useMetaData;
