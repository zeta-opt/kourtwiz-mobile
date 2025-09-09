import * as Notifications from 'expo-notifications';
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '../store';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    // Request notification permissions on app launch
    const requestNotificationPermissions = async () => {
      if (Platform.OS === 'ios') {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();

        // Only ask if we don't already have permission
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status === 'granted') {
            console.log('✅ Notification permissions granted');
          } else {
            console.log('❌ Notification permissions denied');
          }
        } else {
          console.log('✅ Notification permissions already granted');
        }
      }
    };

    requestNotificationPermissions();
  }, []);

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider>
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
