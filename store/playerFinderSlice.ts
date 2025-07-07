import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Contacts from 'expo-contacts';
import { simplifyContacts } from '@/helpers/find-players/phoneContactsToList';
import { AppDispatch, RootState } from '@/store';

const CONTACT_LIST_KEY = 'cachedContactList';

// Define the shape of a single preferred contact
interface Contact {
  contactName: string;
  contactPhoneNumber: string;
}

// Define the shape of the player finder request state
interface PlayerFinderState {
  requestorId: string | null;
  placeToPlay: string | null;
  playTime: string | null;
  playEndTime?: string | null;
  playersNeeded: number | null;
  skillRating: number | null;
  preferredContacts: Contact[];
  contactList: Contact[];
  isContactLoading: boolean;
}

// Initial state for the player finder data
const initialState: PlayerFinderState = {
  requestorId: null,
  placeToPlay: null,
  playTime: null,
  playEndTime: null,
  playersNeeded: null,
  skillRating: null,
  preferredContacts: [],
  contactList: [],
  isContactLoading: false,
};

const playerFinderDataSlice = createSlice({
  name: 'playerFinderData',
  initialState,
  reducers: {
    // Action to set the requestorId
    setRequestorId: (state, action: PayloadAction<string | null>) => {
      state.requestorId = action.payload;
    },
    // Action to set the placeToPlay
    setPlaceToPlay: (state, action: PayloadAction<string | null>) => {
      state.placeToPlay = action.payload;
    },
    // Action to set the playTime
    setPlayTime: (state, action: PayloadAction<string | null>) => {
      state.playTime = action.payload;
    },
    // Action to set the playEndTime
    setPlayEndTime: (state, action: PayloadAction<string | null>) => {
      state.playEndTime = action.payload;
    },
    // Action to set the playersNeeded
    setPlayersNeeded: (state, action: PayloadAction<number | null>) => {
      state.playersNeeded = action.payload;
    },
    // Action to set the skillRating
    setSkillRating: (state, action: PayloadAction<number | null>) => {
      state.skillRating = action.payload;
    },
    // Action to add a single preferred contact
    addPreferredContact: (state, action: PayloadAction<Contact>) => {
      state.preferredContacts.push(action.payload);
    },
    // Action to remove a preferred contact by its index
    removePreferredContact: (state, action: PayloadAction<number>) => {
      state.preferredContacts.splice(action.payload, 1);
    },
    // Action to update an existing preferred contact by its index
    updatePreferredContact: (
      state,
      action: PayloadAction<{ index: number; contact: Contact }>
    ) => {
      const { index, contact } = action.payload;
      if (state.preferredContacts[index]) {
        state.preferredContacts[index] = contact;
      }
    },
    // Action to completely replace the preferred contacts array
    setPreferredContacts: (state, action: PayloadAction<Contact[]>) => {
      state.preferredContacts = action.payload;
    },
    // Cache contact list in AsyncStorage
    setContactList: (state, action: PayloadAction<Contact[]>) => {
      console.log('setting contact list ');
      state.contactList = action.payload;
      AsyncStorage.setItem(CONTACT_LIST_KEY, JSON.stringify(action.payload)).catch(console.error);
    },
    // Load from AsyncStorage
    loadContactListFromStorage: (state, action: PayloadAction<Contact[]>) => {
      state.contactList = action.payload;
    },
    // Action to remove the contact list and clear AsyncStorage
    removeContactList: (state) => {
      state.contactList = [];
      AsyncStorage.removeItem(CONTACT_LIST_KEY).catch(console.error);
    },
    setContactLoading: (state, action: PayloadAction<boolean>) => {
      state.isContactLoading = action.payload;
    },    
    // Action to reset all player finder data to its initial state
    resetPlayerFinderData: () => initialState,
  },
});

export const {
  setRequestorId,
  setPlaceToPlay,
  setPlayTime,
  setPlayEndTime,
  setPlayersNeeded,
  setSkillRating,
  addPreferredContact,
  removePreferredContact,
  updatePreferredContact,
  setPreferredContacts,
  setContactList,
  loadContactListFromStorage,
  removeContactList,
  setContactLoading,
  resetPlayerFinderData,
} = playerFinderDataSlice.actions;

export const loadContacts = (forceRefresh = false) => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(setContactLoading(true));
  try {
    const currentList = getState().playerFinder.contactList;

    // If contacts already loaded and not forcing refresh, use existing
    if (!forceRefresh && currentList.length > 0) {
      dispatch(setContactLoading(false));
      return;
    }

    // Try loading from cache first
    const cachedJson = await AsyncStorage.getItem(CONTACT_LIST_KEY);
    if (cachedJson && !forceRefresh) {
      const cachedContacts = JSON.parse(cachedJson);
      dispatch(loadContactListFromStorage(cachedContacts));
      return;
    }

    // Request permission to access device contacts
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access contacts was denied');
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    const simplified = simplifyContacts(data);
    simplified.sort((a, b) =>
      (a.contactName || '').toLowerCase().localeCompare((b.contactName || '').toLowerCase())
    );    
    dispatch(setContactList(simplified));

  } catch (error) {
    console.error('Failed to load contacts from storage', error);
  } finally {
    dispatch(setContactLoading(false));
  }
};

export default playerFinderDataSlice.reducer;
