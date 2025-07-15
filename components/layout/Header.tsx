import UserAvatar from '@/assets/UserAvatar';
import { RootState } from '@/store';
import { logout } from '@/store/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
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

  const { user } = useSelector((state: RootState) => state.auth);
  // console.log(profileImage, 'helllo');
  const selectedClubname =
    user?.userClubRole?.find(
      (club: any) => club.clubId === user?.currentActiveClubId
    )?.clubName || 'Kourtwiz';

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          onPress: () => {}, // Do nothing
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            dispatch(logout());
            setShowMenu(false);
            router.replace('/');
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const greeting = getGreeting();

  return (
    <SafeAreaView>
      {showMenu && (
        <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      {/* Removed backgroundColor: theme.colors.primary */}
      <View style={styles.header}>
        <Text style={styles.text}>
          {greeting}
          {user?.username ? ` ${user.username.split(' ')[0]}` : ''}
        </Text>

        <View style={styles.profileWrapper}>
          <View style={styles.iconRow}>
            {/* Bell Icon */}
            <TouchableOpacity onPress={() => Alert.alert('Notifications')}>
              <Ionicons
                name='notifications-outline'
                size={24}
                color='black'
                style={{ marginRight: 12 }}
              />
            </TouchableOpacity>

            {/* Profile Picture / Avatar */}
            <TouchableOpacity
              style={styles.profileButton}
              // onPress={() => setShowMenu(true)}
              onPress={() => router.push('/(authenticated)/profile')}
            >
              {/* {profileImage ? (
                <Avatar.Image size={42} source={{ uri: profileImage }} />
              ) : (
                <Avatar.Text
                  size={42}
                  label={
                    user?.username
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase() || 'U'
                  }
                  style={styles.avatar}
                  labelStyle={{ fontSize: 12 }}
                />
              )} */}
              <UserAvatar size={42} />
            </TouchableOpacity>
          </View>

          {/* {showMenu && (
            <View style={styles.menuContainer}>
              <SwitchClub onCloseMenu={() => setShowMenu(false)} />
              <Pressable onPress={handleLogout} style={styles.menuItem}>
                <Text style={styles.menuText}>Logout</Text>
              </Pressable>
            </View>
          )} */}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: '10%',
    marginHorizontal: 1.5,
    height: 45,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  text: {
    fontSize: 20,
    fontWeight: '400',
    color: '#333',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatar: {
    backgroundColor: 'black',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileWrapper: {
    position: 'relative',
    zIndex: 1000,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuContainer: {
    position: 'absolute',
    top: 35,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 160,
    paddingVertical: 4,
    zIndex: 9999,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  menuText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 500, // Below the menuContainer but above screen
  },
});

export default Header;
