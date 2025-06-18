import { RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { closeDrawer } from '@/store/uiSlice';

const routes: { label: string; path: string }[] = [
  { label: '📊 Dashboard', path: '/(authenticated)/dashboard' },
  { label: '👥 Members', path: '/(authenticated)/members' },
  { label: '💳 Membership Plans', path: '/(authenticated)/membership-plans' },
  { label: '📱 Devices', path: '/(authenticated)/devices' },
  { label: '🎾 Courts', path: '/(authenticated)/courts' },
  { label: '⚙️ Settings', path: '/(authenticated)/settings' },
  { label: '📅 Club Booking', path: '/(authenticated)/club-booking' },
  { label: '📦 Assets', path: '/(authenticated)/asserts' },
  { label: '☑️ Bookings', path: '/(authenticated)/court-booking' },
  { label: '⏱️ Previous Coach Bookings', path: '/(authenticated)/previous-coach-bookings' },
  { label: '🙍‍♂️ Profile', path: '/(authenticated)/profile' },
  { label: '🎮 Create Play', path: '/(authenticated)/create-play' },
  { label: '🏋️ Coach', path: '/(authenticated)/coach' },
  { label: '🎨 Themes', path: '/(authenticated)/themes' },
  { label: '📡 Live Updates', path: '/(authenticated)/live-updates' },
  { label: '⏳ Waitlist', path: '/(authenticated)/waitlist' },
  { label: '🎯 Join Play', path: '/(authenticated)/join-play' },
  { label: '🏓 My Play', path: '/(authenticated)/my-play' },
  { label: '✅ My Bookings', path: '/(authenticated)/my-bookings' },
];

export default function SideDrawer() {
  const { drawerOpen } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();
  const router = useRouter();
  const userRoles = useSelector((state: RootState) => state.auth.user?.userClubRole || []);
  if (!drawerOpen) return null;

  interface UserClubRole {
    roleName: string;
    [key: string]: any;
  }
  const isClubAdmin: boolean = userRoles.some((role: UserClubRole) => role.roleName === 'ClubAdmin');

  const restrictedLabelsForNonAdmins = [
    '📊 Dashboard', '👥 Members', '💳 Membership Plans', '📱 Devices',
    '🎾 Courts', '⚙️ Settings', '📅 Club Booking', '📦 Assets',
    '🎮 Create Play', '🏋️ Coach', '🎨 Themes', '📡 Live Updates'
  ];

  const restrictedLabelsForAdmins = [
    '⏱️ Previous Coach Bookings', '⏳ Waitlist', '🎯 Join Play', '🏓 My Play', '✅ My Bookings'
  ];

  const filteredRoutes = routes.filter(route => {
    if (isClubAdmin) {
      return !restrictedLabelsForAdmins.includes(route.label);
    } else {
      return !restrictedLabelsForNonAdmins.includes(route.label);
    }
  });

  const handleNavigate = (path: string) => {
    router.replace(path as any);
    dispatch(closeDrawer());
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.drawer}>
        {filteredRoutes.map((route, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleNavigate(route.path)}
            style={styles.routeItem}
          >
            <Text style={styles.routeText}>{route.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={() => dispatch(closeDrawer())}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 100,
  },
  drawer: {
    width: '70%',
    height: '100%',
    backgroundColor: '#f8f8f8',
    padding: 20,
    paddingTop: 40,
    elevation: 5,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  routeItem: {
    fontSize: 18,
    marginVertical: 10,
  },
  routeText: {
    fontSize: 16,
    color: '#333',
  },
});
