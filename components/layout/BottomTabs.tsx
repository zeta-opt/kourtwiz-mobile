import { RootState } from '@/store';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function BottomTabs() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  console.log(user);
  const hasRoles = user?.userClubRole?.length > 0;

  return (
    <View style={styles.container}>
      {/* {hasRoles && (
        <TouchableOpacity
          onPress={async () => {
            dispatch(toggleDrawer());
          }}
        >
          <MaterialIcons name="menu" size={28} />
        </TouchableOpacity>
      )} */}

      <TouchableOpacity
        onPress={() => router.replace('/(authenticated)/home')}
        style={styles.tabItem}
      >
        <MaterialIcons name='home' size={24} color='#2C7E88' />
        <Text style={styles.activeLabel}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace('/groups')}
        style={styles.tabItem}
      >
        <MaterialIcons name='groups' size={24} color='#000' />
        <Text style={styles.label}>Groups</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace('/videos')}
        style={styles.tabItem}
      >
        <MaterialIcons name='ondemand-video' size={24} color='#000' />
        <Text style={styles.label}>Videos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace('/feedback')}
        style={styles.tabItem}
      >
        <MaterialIcons name='feedback' size={24} color='#000' />
        <Text style={styles.label}>Feedback</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace('/history')}
        style={styles.tabItem}
      >
        <MaterialIcons name='calendar-today' size={24} color='#000' />
        <Text style={styles.label}>History</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity
        onPress={() => router.replace('/(authenticated)/profile')}
      >
        <MaterialIcons name='person' size={28} />
      </TouchableOpacity>

      {user?.userClubRole?.[0]?.roleName !== 'ClubAdmin' && (
        <TouchableOpacity
          onPress={() => router.replace('/(authenticated)/find-players')}
        >
          <MaterialIcons name='group' size={28} />
        </TouchableOpacity>
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 70,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C7E88',
    marginTop: 4,
  },
});
