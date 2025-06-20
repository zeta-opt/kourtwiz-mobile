import { getToken } from "@/shared/helpers/storeToken";
import axios from "axios";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { Booking } from "@/components/my-play/OpenPlayBookingsPage";

type OpenplayBookings = {
  data: Booking[] | null;
  status: "loading" | "error" | "success";
  refetch: () => void;
};

export function useGetOpenplayBookings(userId: string): OpenplayBookings {
  const [data, setData] = useState<Booking[] | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [refetchState, setRefetchState] = useState(false);

  const refetch = () => {
    setRefetchState(prev => !prev);
  };

  useEffect(() => {
    const getOpenplayBookings = async (): Promise<void> => {
      setStatus("loading");
      try {
        const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
        const token = await getToken();

        const response = await axios.get(`${BASE_URL}/api/play-type/bookings/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        });

        if (Array.isArray(response.data)) {
          setData(response.data);
          setStatus("success");
        } else {
          throw new Error("Invalid bookings format received");
        }

      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        setStatus("error");
      }
    };

    if (userId) {
      getOpenplayBookings();
    }
  }, [userId, refetchState]);

  return {
    data,
    status,
    refetch,
  };
}
