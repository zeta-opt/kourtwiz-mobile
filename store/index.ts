import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import playerFinderDataSlice from './playerFinderSlice';
import uiReducer from './uiSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    playerFinder: playerFinderDataSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
