import { getToken } from "@/shared/helpers/storeToken";
import axios from 'axios';
import  Constants  from "expo-constants";
import { useEffect, useState } from "react";

type useDeviceReturn = {
    data : Record<string,any>[] | null;
    status : 'loading' | 'error' | 'success';
    refetch : () => void; 

};

export const useGetClubDevice = ({
    clubId,
} : {
    clubId : string;

}) : useDeviceReturn =>{
    const [data,setData] = useState<Record<string,any>[] | null>(null);
    const [status,setStatus] = useState<'loading' | 'error' | 'success'>('loading');
    const [refetchState,setRefetchState] = useState(false);
    const refetch = ()=>{
        setRefetchState(prev => !prev);
    };
    useEffect(()=>{
        const fetchClubDevice = async (): Promise<void>=>{
            setStatus('loading');
            try{
                const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
                const token = await getToken();
                const response = await axios.get(
                    `${BASE_URL}/api/devices/club/${clubId}`,
                    {
                        headers :{
                            Authorization: `Bearer ${token}`,
                            Accept: '*/*'
                        },
                    }
                );
                setData(response.data);
                setStatus('success');
            }
            catch (error){
                console.error('Failed to fetch devices:', error);
                setStatus('error');

            }

        };
        if(clubId){
            fetchClubDevice();
        }
    }, [clubId,refetchState]);
    return{
        data,
        status,
        refetch
    };
};