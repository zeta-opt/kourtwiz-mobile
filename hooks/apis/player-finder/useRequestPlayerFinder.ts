import { getToken } from '@/shared/helpers/storeToken';
import axios from 'axios';
import Constants from 'expo-constants';
import { useState } from 'react';

// Define types for the payload
interface PreferredContact {
  contactName: string;
  contactPhoneNumber: string;
}

interface PlayerFinderRequest {
  requestorId?: string;
  eventName: string;
  placeToPlay: string;
  playTime: string;
  playEndTime: string;
  playersNeeded: number;
  skillRating: number;
  preferredContacts: PreferredContact[];
}

interface PlaceToSave {
  id?: string;
  netType: string;
  noOfCourts: number;
  openingTime: string;
  closingTime: string;
  isFree: boolean;
  membership: string;
  isRestRoomAvailable: boolean;
  isCarParkingAvailable: boolean;
  creatorId: string;
  isPrivate: boolean;
  geoLocation?: {
    x: number;
    y: number;
    type: string;
    coordinates: number[];
  };
  SN?: number;
  Access?: string;
  'Court Purpose'?: string;
  'Court Type'?: string;
  Latitude?: number;
  Lighting: string;
  Location: string;
  Longitude?: number;
  Name: string;
  'Booking Link'?: string;
}

interface RequestPayload {
  playerFinderRequest: PlayerFinderRequest;
  placeToSave?: PlaceToSave;
}

export const useRequestPlayerFinder = () => {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  const requestPlayerFinder = async ({
    finderData,
    placeToSave,
    callbacks,
  }: {
    finderData: PlayerFinderRequest;
    placeToSave?: PlaceToSave;
    callbacks?: {
      onSuccess?: (data: any) => void;
      onError?: (error: Error) => void;
    };
  }): Promise<void> => {
    setStatus('loading');
    setError(null);

    try {
      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
      const token = await getToken();

      // Construct the payload according to the new structure
      const payload: RequestPayload = {
        playerFinderRequest: finderData,
        ...(placeToSave && { placeToSave }),
      };

      console.log('Player Finder Request Payload:', payload);

      const response = await axios.post(
        `${BASE_URL}/api/player-finder-queue/request`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
        }
      );

      setStatus('success');
      callbacks?.onSuccess?.(response);
    } catch (err: any) {
      setStatus('error');
      console.log(err);
      const errorMessage =
        err?.response?.data?.message || err.message || 'Unknown error';
      setError(errorMessage);
      console.log('error message: ', errorMessage);
      const errorObj = new Error(errorMessage);
      callbacks?.onError?.(errorObj);
    }
  };

  return { requestPlayerFinder, status, error };
};
