import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';

// Initialize FCM listeners
export const setupFCMHandlers = () => {
  // 1️⃣ Background & Quit state messages
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('FCM Background Message:', remoteMessage);
    await displayNotificationWithExpo(remoteMessage);
  });

  // 2️⃣ Foreground messages
  messaging().onMessage(async (remoteMessage) => {
    console.log('FCM Foreground Message:', remoteMessage);
    await displayNotificationWithExpo(remoteMessage);
  });

  // 3️⃣ When a user taps on a notification
  messaging().onNotificationOpenedApp(async (remoteMessage) => {
    console.log('Notification opened from background state:', remoteMessage);
    // Handle navigation or other logic here
  });

  // 4️⃣ When app is opened from a quit state via a notification
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log(
          'App opened from quit state via notification:',
          remoteMessage
        );
        // Handle navigation or other logic here
      }
    });
};

// Helper to show notifications using Expo Notifications
const displayNotificationWithExpo = async (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
) => {
  if (!remoteMessage.notification) return;

  try {
    // Schedule notification to show immediately
    await Notifications.scheduleNotificationAsync({
      content: {
        title: remoteMessage.notification.title || 'New Message',
        body: remoteMessage.notification.body || '',
        data: remoteMessage.data || {},
        sound: true,
      },
      trigger: null, // Show immediately
    });

    console.log('✅ Notification displayed via Expo');
  } catch (error) {
    console.error('❌ Error displaying notification:', error);
  }
};
