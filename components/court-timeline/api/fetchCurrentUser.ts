import { getToken } from "@/shared/helpers/storeToken";
import axios from "axios";

const VITE_API_BASE_URL = "https://api.vddette.com";
export const fetchCurrentUser = async () => {
  const token = await getToken();
  if (!token) throw new Error("Missing auth token");

  const res = await axios.get(`${VITE_API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
