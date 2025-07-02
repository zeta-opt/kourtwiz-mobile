import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    drawerOpen: false,
    playerFinderModal: false,
    preferredPlaceModal: false,
    searchPlaceModal: false,
    selectContactsModal: false,
  },
  reducers: {
    openDrawer: (state) => {
      state.drawerOpen = true;
    },
    closeDrawer: (state) => {
      state.drawerOpen = false;
    },
    toggleDrawer: (state) => {
      state.drawerOpen = !state.drawerOpen;
    },
    //for player finder
    openPlayerFinderModal: (state) => {
      state.playerFinderModal = true;
    },
    closePlayerFinderModal: (state) => {
      state.playerFinderModal = false;
    },
    openPreferredPlaceModal: (state) => {
      state.preferredPlaceModal = true;
    },
    closePreferredPlaceModal: (state) => {
      state.preferredPlaceModal = false;
    },
    openSearchPlaceModal: (state) => {
      state.searchPlaceModal = true;
    },
    closeSearchPlaceModal: (state) => {
      state.searchPlaceModal = false;
    },    
    openSelectContactsModal: (state) => {
      state.selectContactsModal = true;
    },
    closeSelectContactsModal: (state) => {
      state.selectContactsModal = false;
    },
  },
});

export const {
  openDrawer,
  closeDrawer,
  toggleDrawer,
  openPlayerFinderModal,
  closePlayerFinderModal,
  openPreferredPlaceModal,
  closePreferredPlaceModal,
  openSearchPlaceModal,
  closeSearchPlaceModal,
  openSelectContactsModal,
  closeSelectContactsModal,
} = uiSlice.actions;
export default uiSlice.reducer;
