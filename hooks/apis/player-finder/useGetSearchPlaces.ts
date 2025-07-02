import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';

type UseGetSearchPlacesReturn = {
  data: Record<string, any>[] | null;
  status: 'loading' | 'error' | 'success';
  refetch: () => void;
};

type Params = {
  lat: number;
  lng: number;
  maxDistanceInKm?: number;
  page?: number;
  limit?: number;
};

export const useGetSearchPlaces = ({
  lat,
  lng,
  maxDistanceInKm,
  page,
  limit,
}: Params): UseGetSearchPlacesReturn => {
  const [data, setData] = useState<Record<string, any>[] | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading'
  );

  const [refetchState, setRefetchState] = useState(false);
  const refetch = () => setRefetchState((prev) => !prev);

  useEffect(() => {
    const fetchNearbyCourts = async () => {
      setStatus('loading');
      try {
        const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
        const token = await getToken();
        const response = await axios.get(
          `${BASE_URL}/api/import/nearby`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: '*/*',
            },
            params: {
              lat,
              lng,
              maxDistanceInKm,
              page,
              limit,
            },
          }
        );

        setData(response.data || []);
        setStatus('success');
      } catch (error) {
        console.error('Failed to fetch nearby courts:', error);
        setStatus('error');
      }
    };

    if (lat && lng) {
      fetchNearbyCourts();
    }
  }, [lat, lng, maxDistanceInKm, page, limit, refetchState]);

  return {
    data,
    status,
    refetch,
  };
};