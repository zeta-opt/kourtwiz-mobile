// store/refetchSlice.ts
import { createSlice } from '@reduxjs/toolkit';

interface RefetchState {
  shouldRefetchInvitations: boolean;
  shouldRefetchNotifications: boolean;
}

const initialState: RefetchState = {
  shouldRefetchInvitations: false,
  shouldRefetchNotifications: false,
};

const refetchSlice = createSlice({
  name: 'refetch',
  initialState,
  reducers: {
    triggerInvitationsRefetch: (state) => {
      state.shouldRefetchInvitations = true;
    },
    resetInvitationsRefetch: (state) => {
      state.shouldRefetchInvitations = false;
    },
    triggerNotificationsRefetch: (state) => {
      state.shouldRefetchNotifications = true;
    },
    resetNotificationsRefetch: (state) => {
      state.shouldRefetchNotifications = false;
    },
  },
});

export const {
  triggerInvitationsRefetch,
  resetInvitationsRefetch,
  triggerNotificationsRefetch,
  resetNotificationsRefetch,
} = refetchSlice.actions;

export default refetchSlice.reducer;
