import { useEffect, useState } from "react";
import axios from "axios";
import Constants from "expo-constants";
import { getToken } from "@/shared/helpers/storeToken";

type Booking = {
  id: string;
  userId: string;
  coachId?: string;
  courtId?: string;
};

type ClubBookings = {
  data: Booking[] | null;
  status: "loading" | "error" | "success";
  refetch: () => void;
};

export function useGetClubBookings(clubId: string): ClubBookings {
  const [data, setData] = useState<Booking[] | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [refetchState, setRefetchState] = useState(false);

  const refetch = () => {
    setRefetchState(prev => !prev);
  };

  useEffect(() => {
    const fetchClubBookings = async () => {
      setStatus("loading");

      try {
        const token = await getToken();
        const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

        const response = await axios.get(`${BASE_URL}/api/bookings/club/${clubId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (Array.isArray(response.data)) {
          setData(response.data);
          setStatus("success");
        } else {
          throw new Error("Invalid response format");
        }

      } catch (err) {
        console.error("Error fetching club bookings:", err);
        setStatus("error");
      }
    };

    if (clubId) {
      fetchClubBookings();
    }
  }, [clubId, refetchState]);

  return {
    data,
    status,
    refetch,
  };
}
