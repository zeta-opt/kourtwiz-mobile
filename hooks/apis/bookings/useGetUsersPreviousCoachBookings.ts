import { getToken } from "@/shared/helpers/storeToken";
import axios from "axios";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { UserPreviousBooking } from "@/components/previous-coach-bookings/PreviousCoachBookingCard";

type UsePreviousBookings = {
  data: UserPreviousBooking[] | null;
  status: "loading" | "error" | "success";
  refetch: () => void;
};

export function useGetPreviousCoachBookings(userId: string): UsePreviousBookings {
  const [data, setData] = useState<UserPreviousBooking[] | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [refetchState, setRefetchState] = useState(false);

  const refetch = () => {
    setRefetchState(prev => !prev);
  };

  useEffect(() => {
    const getPreviousBookings = async (): Promise<void> => {
      setStatus("loading");
      try {
        const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
        const token = await getToken();

        const response = await axios.get(`${BASE_URL}/api/bookings/user/${userId}`, {
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
          throw new Error("Invalid response format for previous bookings");
        }
      } catch (error) {
        console.error("Failed to fetch previous coach bookings:", error);
        setStatus("error");
      }
    };

    if (userId) {
      getPreviousBookings();
    }
  }, [userId, refetchState]);

  return {
    data,
    status,
    refetch,
  };
}
