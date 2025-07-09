import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null; // /me response type can be updated later with real shape
  token: string | null;
  profileImage: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  profileImage: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.profileImage = null;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.profileImage = null;
    },
    setProfileImage(state, action: PayloadAction<string>) {
      state.profileImage = action.payload;
    },
  },
});

export const { login, logout, setProfileImage } = authSlice.actions;
export default authSlice.reducer;
