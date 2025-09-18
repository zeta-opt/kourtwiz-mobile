import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

type NotificationData = Record<string, any>;

// Initialize APNs listeners
export const setupAPNsHandlers = () => {
  if (Platform.OS !== 'ios') return;

  console.log('🔔 Setting up APNs handlers...');

  // Foreground notification handler
  const foregroundListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('📲 APNs Foreground Notification:', notification);
    }
  );

  // Background/quit notification tap handler
  const responseListener =
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('👆 APNs Notification tapped:', response);
      // Handle navigation or deep link logic here
    });

  console.log('✅ APNs Handlers Registered');

  // Cleanup listeners
  return () => {
    foregroundListener.remove();
    responseListener.remove();
  };
};

// Helper: Show a local notification on iOS (if you want to mimic FCM’s display)
export const displayNotificationWithExpo = async (
  title: string,
  body: string,
  data: NotificationData = {}
) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title || 'New Notification',
        body: body || '',
        data,
        sound: true,
      },
      trigger: null, // Show immediately
    });

    console.log('✅ Notification displayed via Expo (APNs)');
  } catch (error) {
    console.error('❌ Error displaying APNs notification:', error);
  }
};
