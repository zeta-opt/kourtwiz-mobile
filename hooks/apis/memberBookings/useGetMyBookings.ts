import React from "react";
import axios from "axios";
import Constants from "expo-constants";

type useBookingsReturn = {
    data: Record<string, any>[] | null;
    status: 'loading' | 'error' | 'success';
    refetch: () => void;  
};
import { getToken } from "@/shared/helpers/storeToken";

export const useGetMyBookings = ({
    userId,
}: {
    userId: string;
}) : useBookingsReturn => {
    const [data, setData] = React.useState<Record<string, any>[] | null>(null);
    const [status, setStatus] = React.useState<'loading' | 'error' | 'success'>('loading');
    const [refetchState, setRefetchState] = React.useState(false);

    const refetch = () => {
        setRefetchState(prev => !prev);
    };

    React.useEffect(() => {
        const fetchBookings = async (): Promise<void> => {
            setStatus('loading');
            try {
                const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
                const token = await getToken();
                const response = await axios.get(
                    `${BASE_URL}/api/bookings/user/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: '*/*',
                        },
                    }
                );
                setData(response.data);
                console.log(data);
                setStatus('success');
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
                setStatus('error');
            }
        };
        if (userId) {
            fetchBookings();
        }
    }, [userId, refetchState]);

    return { data, status, refetch };
}