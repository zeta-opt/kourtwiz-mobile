import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { toggleDrawer } from '../../store/uiSlice';

export default function BottomTabs() {
  const router = useRouter();
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => dispatch(toggleDrawer())}>
        <MaterialIcons name='menu' size={28} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/(authenticated)/home')}>
        <MaterialIcons name='home' size={28} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace('/(authenticated)/profile')}
      >
        <MaterialIcons name='person' size={28} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
});
