// Create this file: store/refetchSlice.ts
import { createSlice } from '@reduxjs/toolkit';

interface RefetchState {
  shouldRefetchInvitations: boolean;
}

const initialState: RefetchState = {
  shouldRefetchInvitations: false,
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
  },
});

export const { triggerInvitationsRefetch, resetInvitationsRefetch } =
  refetchSlice.actions;
export default refetchSlice.reducer;
