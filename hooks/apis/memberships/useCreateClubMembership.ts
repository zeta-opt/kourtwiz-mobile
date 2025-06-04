import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useState } from 'react';

type CustomPerk = {
  name: string;
  value: string;
};

interface Perks {
  advanceBookingDays?: number;
  openPlaySessionsAllowed?: number;
  tournamentAccess?: number;
  guestPasses?: number;
  coachingSessions?: number;
  [key: string]: number | undefined;
}
  
  
export interface MembershipFormValues {
  membershipName: string;
  duration: 'Monthly';
  price: number;
  perks: Perks;
  customPerks: CustomPerk[];
}

export const perkLabels: Record<string, string> = {
  gymAccess: 'Gym Access',
  swimmingPool: 'Swimming Pool',
  sauna: 'Sauna Access',
  personalTrainer: 'Personal Trainer',
  spa: 'Spa Access',
};

export const useCreateClubMembership = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const createMembership = async ({
    formData,
    clubId,
    callbacks,
    }:{
    formData: MembershipFormValues,
    clubId: string,
    callbacks?: {
      onSuccess?: (data: any) => void;
      onError?: (error: Error) => void;
    }
  }): Promise<void> => {
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();
  
      const payload = {
        clubId,
        membershipName: formData.membershipName.charAt(0).toUpperCase() + formData.membershipName.slice(1),
        duration: formData.duration.toUpperCase(),
        price: formData.price,
        perks: {
          advanceBookingDays: formData.perks.advanceBookingDays || 0,
          openPlaySessionsAllowed: formData.perks.openPlaySessionsAllowed || 0,
          tournamentAccess: formData.perks.tournamentAccess || 0,
          guestPasses: formData.perks.guestPasses || 0,
          coachingSessions: formData.perks.coachingSessions || 0,
        },
        customPerks: formData.customPerks.map(perk => ({
          name: perk.name.charAt(0).toUpperCase() + perk.name.slice(1),
          value: perk.value
        })),
      };
  
      const response = await axios.post(
        `${BASE_URL}/api/membership-plans/create`, 
        payload, 
        {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      });
      
      setStatus('success');
      callbacks?.onSuccess?.(response.data);
    } catch (err: any) {
      setStatus('error');
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to create membership';
      setError(errorMessage);
      callbacks?.onError?.(new Error(errorMessage));
      throw new Error(errorMessage);
    }
  };

  return { createMembership, status, error };
};