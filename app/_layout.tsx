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
    // ✅ Only run FCM setup on Android (skip iOS to avoid Firebase error)
    if (Platform.OS === 'android') {
      setupFCMHandlers();
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

        // Request permission if not already granted
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus === 'granted') {
          console.log(`✅ Notification permissions granted on ${Platform.OS}`);

          // Setup Android notification channel
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

    // Optional: Listen for notification events (when using Expo to display)
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📱 Expo Notification received:', notification);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('👆 Expo Notification clicked:', response);
        // Handle navigation based on notification data
      });

    // Cleanup
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
