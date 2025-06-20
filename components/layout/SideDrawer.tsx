import { RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, usePathname } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { closeDrawer } from '@/store/uiSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // ✅ Correct Expo import

const routes: { label: string; path: string; icon: string }[] = [
  { label: 'Home', path: '/(authenticated)/home', icon: 'home' },
  { label: 'Dashboard', path: '/(authenticated)/dashboard', icon: 'view-dashboard-outline' },
  { label: 'Members', path: '/(authenticated)/members', icon: 'account-group-outline' },
  { label: 'Membership Plans', path: '/(authenticated)/membership-plans', icon: 'credit-card-multiple-outline' },
  { label: 'Devices', path: '/(authenticated)/devices', icon: 'cellphone-link' },
  { label: 'Courts', path: '/(authenticated)/courts', icon: 'tennis' },
  { label: 'Settings', path: '/(authenticated)/settings', icon: 'cog-outline' },
  { label: 'Club Booking', path: '/(authenticated)/club-booking', icon: 'calendar-month-outline' },
  { label: 'Assets', path: '/(authenticated)/asserts', icon: 'cube-outline' },
  { label: 'Bookings', path: '/(authenticated)/court-booking', icon: 'checkbox-marked-outline' },
  { label: 'Previous Coach Bookings', path: '/(authenticated)/previous-coach-bookings', icon: 'history' },
  { label: 'Profile', path: '/(authenticated)/profile', icon: 'account-circle-outline' },
  { label: 'Create Play', path: '/(authenticated)/create-play', icon: 'controller-classic-outline' },
  { label: 'Coach', path: '/(authenticated)/coach', icon: 'whistle-outline' },
  { label: 'Themes', path: '/(authenticated)/themes', icon: 'palette-outline' },
  { label: 'Live Updates', path: '/(authenticated)/live-updates', icon: 'broadcast' },
  { label: 'Waitlist', path: '/(authenticated)/waitlist', icon: 'timer-sand-empty' },
  { label: 'Join Play', path: '/(authenticated)/join-play', icon: 'target' },
  { label: 'My Play', path: '/(authenticated)/my-play', icon: 'table-tennis' },
  { label: 'My Bookings', path: '/(authenticated)/my-bookings', icon: 'calendar-check-outline' },
];

export default function SideDrawer() {
  const { drawerOpen } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const userRoles = useSelector((state: RootState) => state.auth.user?.userClubRole || []);

  if (!drawerOpen) return null;

  const isClubAdmin = userRoles.some((r: any) => r.roleName === 'ClubAdmin');

  const adminOnlyLabels = [
    'Dashboard', 'Members', 'Membership Plans', 'Devices',
    'Courts', 'Settings', 'Club Booking', 'Assets',
    'Create Play', 'Coach', 'Themes', 'Live Updates'
  ];

  const nonAdminOnlyLabels = [
    'Previous Coach Bookings', 'Waitlist', 'Join Play', 'My Play', 'My Bookings'
  ];

  const filteredRoutes = routes.filter(route => {
    if (isClubAdmin) {
      return !nonAdminOnlyLabels.includes(route.label);
    } else {
      return !adminOnlyLabels.includes(route.label);
    }
  });

  const handleNavigate = (path: string) => {
    router.replace(path as any);
    dispatch(closeDrawer());
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.drawer}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {filteredRoutes.map((route, index) => {
            const cleanPath = route.path.replace('/(authenticated)', '');
            const isActive = pathname === cleanPath;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleNavigate(route.path)}
                style={[styles.routeItem, isActive && styles.activeRoute]}
              >
                <MaterialCommunityIcons
                  name={route.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={22}
                  style={[styles.icon, isActive && styles.activeIcon]}
                />
                <Text style={[styles.routeText, isActive && styles.activeText]}>
                  {route.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
    width: '75%',
    height: '100%',
    backgroundColor: '#fdfdff',
    paddingTop: 50,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f5f9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 4, // ✅ Reduced spacing
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e4f0',
  },
  icon: {
    marginRight: 14,
    color: '#555',
  },
  routeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  activeRoute: {
    backgroundColor: '#dfe6ff',
    borderColor: '#3b5bfd',
  },
  activeIcon: {
    color: '#3b5bfd',
  },
  activeText: {
    color: '#3b5bfd',
  },
});
