import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "@/shared/helpers/storeToken";
import Constants from "expo-constants";

interface NearbyParams {
  lat: number;
  lng: number;
  radius: number;
}

export const usePlayersNearby = ({ lat, lng, radius }: NearbyParams) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lat == null || lng == null || radius == null) return;

    const fetchNearby = async () => {
      setLoading(true);
      setError(null);

      try {
        const today = new Date();
        const startDate = today.toISOString().split("T")[0];

        const end = new Date(today);
        end.setDate(today.getDate() + 3);
        const endDate = end.toISOString().split("T")[0];

        const token = await getToken();
      
      console.log('📦 Token from getToken():', token);
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
        const url = `${BASE_URL}/api/bookings/user-data/date-range?startDate=${startDate}&endDate=${endDate}&latitude=${lat}&longitude=${lng}&radius=${radius}`;

        console.log("Calling API:", url);

        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        });

        console.log("API Response:", res.data);

        setData(res.data || []);
      } catch (err: any) {
        console.error("Player Near By API Error:", err);
        setError(err?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchNearby();
  }, [lat, lng, radius]);

  return { data, loading, error };
};
