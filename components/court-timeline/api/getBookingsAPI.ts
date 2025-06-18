import { getToken } from "@/shared/helpers/storeToken";
import axios from "axios";

const VITE_API_BASE_URL = "https://api.vddette.com";
export const fetchBookings = async (clubId: string) => {
  const token = await getToken();
  const BASE_URL = VITE_API_BASE_URL;
  const response = await axios.get(
    `${BASE_URL}/api/bookings/all-bookings/${clubId}`,
    {
      headers: {
        "Content-Type": "applicataion/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
console.log("fetch bookings", response.data)
  const { courtBooking } = response.data;
  return courtBooking;
};

export const fetchCourts = async (clubId: string) => {
  const token = await getToken();
  const BASE_URL = VITE_API_BASE_URL;
  const response = await axios.get(`${BASE_URL}/courts/club/${clubId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.map((court: any) => ({
    id: court.id,
    title: court.name,
  }));
};
