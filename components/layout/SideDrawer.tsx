import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { closeDrawer } from '../../store/uiSlice';

export default function SideDrawer() {
  const { drawerOpen } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();

  if (!drawerOpen) return null;

  return (
    <View style={styles.overlay}>
      {/* Drawer comes first - left side */}
      <View style={styles.drawer}>
        <Text style={styles.item}>🏠 Dashboard</Text>
        <Text style={styles.item}>⚙️ Settings</Text>
      </View>

      {/* Backdrop comes second - right side */}
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
    flexDirection: 'row', // left to right
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
