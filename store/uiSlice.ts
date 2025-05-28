import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    drawerOpen: false,
    playerFinderModal: false,
    preferredPlaceModal: false,
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
} = uiSlice.actions;
export default uiSlice.reducer;
