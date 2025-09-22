import UserAvatar from '@/assets/UserAvatar';
import {
  useGetUnreadCount,
  useMarkAsRead,
} from '@/hooks/apis/notifications/UseNotifications';
import { RootState } from '@/store';
import { logout } from '@/store/authSlice';
import { resetNotificationsRefetch } from '@/store/refetchSlice';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Text as RNText,
  SafeAreaView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const Header = () => {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const [isIn, setIsIn] = useState(true); // toggle state

  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId || '';
  const shouldRefetchNotifications = useSelector(
    (state: RootState) => state.refetch.shouldRefetchNotifications
  );

  const selectedClubname =
    user?.userClubRole?.find(
      (club: any) => club.clubId === user?.currentActiveClubId
    )?.clubName || 'Kourtwiz';

  const greeting = getGreeting();

  // --- Notifications hooks ---
  const { count: unreadCount, refetch: refetchUnread } =
    useGetUnreadCount(userId);
  const { markAsRead, status: markStatus } = useMarkAsRead(userId);

  const handleBellPress = async () => {
    try {
      // Mark all notifications as read
      await markAsRead();
      // Refetch unread count
      refetchUnread();
      // Navigate to notifications screen
      router.push('/(authenticated)/notifications');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark notifications as read');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            setShowMenu(false);
            router.replace('/');
          },
        },
      ],
      { cancelable: true }
    );
  };
  useEffect(() => {
    if (shouldRefetchNotifications) {
      refetchUnread();
      dispatch(resetNotificationsRefetch());
    }
  }, [shouldRefetchNotifications, refetchUnread, dispatch]);

  return (
    <SafeAreaView>
      {showMenu && (
        <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <View style={styles.header}>
        <View>
          <Text style={styles.text}>
            {greeting}
            {user?.username ? ` ${user.username.split(' ')[0]}` : ''}
          </Text>
          <Text style={styles.text2}>Ready To Play Today?</Text>
        </View>

        <View style={styles.profileWrapper}>
          <View style={styles.iconRow}>
            <View style={styles.toggleWrapper}>
              <Switch value={isIn} onValueChange={setIsIn} />
              <Text style={styles.toggleLabel}>{isIn ? 'Out' : 'In'}</Text>
            </View>
            {/* Bell Icon with unread count */}
            <TouchableOpacity
              onPress={handleBellPress}
              style={{ marginRight: 12 }}
            >
              <Ionicons name='notifications-outline' size={24} color='black' />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <RNText style={styles.badgeText}>{unreadCount}</RNText>
                </View>
              )}
            </TouchableOpacity>

            {/* Profile Avatar */}
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/(authenticated)/profile')}
            >
              <UserAvatar size={42} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  text2: { fontSize: 14, fontWeight: '400', color: '#000', marginTop: 4 },
  header: {
    marginTop: '10%',
    marginBottom: '2%',
    marginHorizontal: 1.5,
    height: 45,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  text: { fontSize: 20, fontWeight: '500', color: '#333' },
  profileButton: { flexDirection: 'row', alignItems: 'center' },
  profileWrapper: { position: 'relative', zIndex: 1000 },
  iconRow: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 500 },
  toggleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 0,
    transform: [{ scale: 0.8 }],
  },
  toggleLabel: {
    fontSize: 16,
    marginRight: 0,
    color: 'black',
  },
});

export default Header;
