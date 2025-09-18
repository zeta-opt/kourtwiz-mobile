import { setupAPNsHandlers } from '@/services/notifications/apnsHandlers'; // 👈 you'll create this file
import { setupFCMHandlers } from '@/services/notifications/fcmHandler';
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

// Configure how notifications should be handled when the app is in the foreground
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
    if (Platform.OS === 'android') {
      setupFCMHandlers();
    } else if (Platform.OS === 'ios') {
      setupAPNsHandlers();
    }
  }, []);

  useEffect(() => {
    // Setup Expo notification permissions and channels
    const setupExpoNotifications = async () => {
      try {
        // Check current permission status
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus === 'granted') {
          console.log(`✅ Notification permissions granted on ${Platform.OS}`);

          if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
              name: 'default',
              importance: Notifications.AndroidImportance.MAX,
              vibrationPattern: [0, 250, 250, 250],
              lightColor: '#FF231F7C',
              sound: 'default',
            });
          }
        } else {
          console.log(`❌ Notification permissions denied on ${Platform.OS}`);
        }
      } catch (error) {
        console.error('❌ Error setting up notifications:', error);
      }
    };

    setupExpoNotifications();

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📱 Expo Notification received:', notification);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('👆 Expo Notification clicked:', response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
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
