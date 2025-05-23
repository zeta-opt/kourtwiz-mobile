import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { closeDrawer } from '../../store/uiSlice';

const routes: { label: string; path: string }[] = [
  { label: '📊 Dashboard', path: '/(authenticated)/dashboard' },
  { label: '👥 Members', path: '/(authenticated)/members' },
  { label: '💳 Membership Plans', path: '/(authenticated)/membership-plans' },
  { label: '📱 Devices', path: '/(authenticated)/devices' },
  { label: '🎾 Courts', path: '/(authenticated)/courts' },
  { label: '⚙️ Settings', path: '/(authenticated)/settings' },
  { label: '📅 Club Booking', path: '/(authenticated)/club-booking' },
  { label: '📦 Assets', path: '/(authenticated)/asserts' },
  { label: '🙍‍♂️ Profile', path: '/(authenticated)/profile' },
  { label: '🎮 Create Play', path: '/(authenticated)/create-play' },
  { label: '🏋️ Coach', path: '/(authenticated)/coach' },
  { label: '🎨 Themes', path: '/(authenticated)/themes' },
  { label: '📡 Live Updates', path: '/(authenticated)/live-updates' },
];

export default function SideDrawer() {
  const { drawerOpen } = useSelector((state: RootState) => state.ui);
  const { user } = useSelector((state: RootState) => state.auth);
  console.log('user data from side bar:', user);
  const dispatch = useDispatch();
  const router = useRouter();

  if (!drawerOpen) return null;

  const handleNavigate = (path: string) => {
    router.replace(path);
    dispatch(closeDrawer());
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.drawer}>
        {routes.map((route, index) => (
          <Pressable key={index} onPress={() => handleNavigate(route.path)}>
            <Text style={styles.item}>{route.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={styles.backdrop}
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
  item: {
    fontSize: 18,
    marginVertical: 10,
  },
});
