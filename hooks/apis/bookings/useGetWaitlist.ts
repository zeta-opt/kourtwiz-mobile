import { getToken } from "@/shared/helpers/storeToken";
import axios from "axios";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { WaitlistCardProps } from "@/components/waitlist/WaitlistCard";

export type GetWaitlist = {
  data: WaitlistCardProps[] | null;
  status: "loading" | "error" | "success";
  refetch: () => void;
};

export function useGetWaitlist(userId: string): GetWaitlist {
  const [data, setData] = useState<WaitlistCardProps[] | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [refetchState, setRefetchState] = useState(false);

  const refetch = () => {
    setRefetchState((prev) => !prev);
  };

  useEffect(() => {
    const getWaitlist = async (): Promise<void> => {
      setStatus("loading");
      try {
        const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
        const token = await getToken();

        const response = await axios.get(`${BASE_URL}/api/play-type/waitlist?userId=${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        });

        setData(response.data);
        setStatus("success");
      } catch (err) {
        console.error("Error fetching waitlist:", err);
        setStatus("error");
      }
    };

    if (userId) {
      getWaitlist();
    }
  }, [userId, refetchState]);

  return {
    data,
    status,
    refetch,
  };
}
