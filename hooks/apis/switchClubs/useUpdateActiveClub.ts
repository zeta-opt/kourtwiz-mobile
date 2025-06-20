import { getToken } from "@/shared/helpers/storeToken";
import axios from "axios";
import Constants from "expo-constants";
import { useState, useCallback } from "react";

type UseUpdateActiveClubReturn = {
  updateClub: (clubId: string) => Promise<void>;
  status: "idle" | "loading" | "success" | "error";
  loading: boolean;
  error: boolean;
  success: boolean;
  reset: () => void;
};

const useUpdateActiveClub = (): UseUpdateActiveClubReturn => {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const updateClub = useCallback(async (clubId: string) => {
    setStatus("loading");
    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();
      await axios.put(
        `${BASE_URL}/users/change-active-club/${clubId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        }
      );
      setStatus("success");
    } catch (error) {
      console.error("Failed to update active club:", error);
      setStatus("error");
    }
  }, []);

  const reset = () => setStatus("idle");

  return {
    updateClub,
    status,
    loading: status === "loading",
    error: status === "error",
    success: status === "success",
    reset,
  };
};

export default useUpdateActiveClub;
