import { createSlice } from '@reduxjs/toolkit';

type UserRole = 'client' | 'admin' | 'superAdmin';

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  role: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.role = action.payload.role;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.role = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
