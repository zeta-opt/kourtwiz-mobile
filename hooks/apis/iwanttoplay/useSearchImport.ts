import axios from 'axios';
import Constants from 'expo-constants'; // Ensure apiUrl is set in app config
import { useCallback, useEffect, useState } from 'react';
import { getToken } from '@/shared/helpers/storeToken';

type SearchImportParams = {
  search: string;
  page?: number;
  size?: number;
  userId?: string;
};

export const useSearchImport = ({
  search,
  userId,
  page = 0,
  size = 10,
}: SearchImportParams) => {
  const [data, setData] = useState<any | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    if (!search || !userId) return;
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();
      const params = {
        page,
        size,
        search,
        userId,
      };
      const response = await axios.get(`${BASE_URL}/api/import/search`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: '*/*',
        },
        params,
      });
      setData(response.data);
      setStatus('success');
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err.message || 'Something went wrong';
      setError(errorMessage);
      setStatus('error');
    }
  }, [search, userId, page, size]);

  useEffect(() => {
    if (search && userId) fetchResults();
  }, [search, userId, page, size, fetchResults]);

  return {
    data,
    status,
    error,
    refetch: fetchResults,
  };
};
