import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of a single preferred contact
interface Contact {
  contactName: string;
  contactPhoneNumber: string;
}

// Define the shape of the player finder request state
interface PlayerFinderState {
  requestorId: string | null;
  placeToPlay: string | null;
  playTime: string | null; // Keeping as string for now, could be Date if parsed
  playersNeeded: number | null;
  skillRating: number | null;
  preferredContacts: Contact[];
  contactList: Contact[];
}

// Initial state for the player finder data
const initialState: PlayerFinderState = {
  requestorId: null,
  placeToPlay: null,
  playTime: null,
  playersNeeded: null,
  skillRating: null,
  preferredContacts: [],
  contactList: [],
};

const playerFinderDataSlice = createSlice({
  name: 'playerFinderData', // A distinct name for this slice
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
    setContactList: (state, action: PayloadAction<Contact[]>) => {
      console.log('setting contact list ');
      state.contactList = action.payload;
    },
    removeContactList: (state) => {
      state.contactList = [];
    },
    // Action to reset all player finder data to its initial state
    resetPlayerFinderData: (state) => {
      return initialState;
    },
  },
});

export const {
  setRequestorId,
  setPlaceToPlay,
  setPlayTime,
  setPlayersNeeded,
  setSkillRating,
  addPreferredContact,
  removePreferredContact,
  updatePreferredContact,
  setPreferredContacts,
  setContactList,
  removeContactList,
  resetPlayerFinderData,
} = playerFinderDataSlice.actions;

export default playerFinderDataSlice.reducer;
