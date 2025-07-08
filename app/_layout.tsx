import { Slot } from 'expo-router';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';
import { LightTheme, DarkTheme } from '@/theme/theme'; // adjust if needed

export default function RootLayout() {
  const colorScheme = useColorScheme(); // 'light' | 'dark' | null
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <>
              <Slot />
              <Toast />
            </>
          </SafeAreaProvider>
        </PaperProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
