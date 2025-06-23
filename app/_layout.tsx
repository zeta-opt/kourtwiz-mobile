import { Slot } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '../store';

export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <SafeAreaProvider>
          <>
            <Slot />
            <Toast />
          </>
        </SafeAreaProvider>
      </PaperProvider>
    </ReduxProvider>
  );
}
