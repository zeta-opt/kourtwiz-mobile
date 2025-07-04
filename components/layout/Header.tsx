import { RootState } from '@/store';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  Pressable,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { Avatar, Text, useTheme } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { logout } from '@/store/authSlice';
import SwitchClub from './SwitchClub';

const Header = () => {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);
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

  return (
    <SafeAreaView>
      {/* If menu is visible, wrap whole screen in overlay */}
      {showMenu && (
        <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.title}>{selectedClubname}</Text>

        <View style={styles.profileWrapper}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => setShowMenu((prev) => !prev)}
          >
            <Avatar.Icon size={26} icon="account" style={styles.avatar} />
            <MaterialIcons name="expand-more" size={24} color="white" />
          </TouchableOpacity>

          {showMenu && (
            <View style={styles.menuContainer}>
              <SwitchClub onCloseMenu={() => setShowMenu(false)} />
              <Pressable onPress={handleLogout} style={styles.menuItem}>
                <Text style={styles.menuText}>Logout</Text>
              </Pressable>
            </View>
          )}
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
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatar: {
    backgroundColor: 'white',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileWrapper: {
    position: 'relative',
    zIndex: 1000,
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
