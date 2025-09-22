import { RootState } from '@/store';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function BottomTabs() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  console.log(user);
  const hasRoles = user?.userClubRole?.length > 0;

  const segments = useSegments();
  const currentPath = '/' + segments.join('/');

  // Helper to check if a route is active by prefix matching
  const isActive = (route: string) => currentPath.startsWith(route);

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
        <MaterialIcons
          name="home"
          size={24}
          color={isActive('/(authenticated)/home') ? '#2C7E88' : '#000'}
        />
        <Text style={isActive('/(authenticated)/home') ? styles.activeLabel : styles.label}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace('/(authenticated)/groups')}
        style={styles.tabItem}
      >
        <MaterialIcons
          name="groups"
          size={24}
          color={isActive('/(authenticated)/groups') ? '#2C7E88' : '#000'}
        />
        <Text style={isActive('/(authenticated)/groups') ? styles.activeLabel : styles.label}>
          Groups
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace('/(authenticated)/videos')}
        style={styles.tabItem}
      >
        <MaterialIcons
          name="ondemand-video"
          size={24}
          color={isActive('/(authenticated)/videos') ? '#2C7E88' : '#000'}
        />
        <Text style={isActive('/(authenticated)/videos') ? styles.activeLabel : styles.label}>
          Videos
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace('/(authenticated)/feedback')}
        style={styles.tabItem}
      >
        <MaterialIcons
          name="feedback"
          size={24}
          color={isActive('/(authenticated)/feedback') ? '#2C7E88' : '#000'}
        />
        <Text style={isActive('/(authenticated)/feedback') ? styles.activeLabel : styles.label}>
          Feedback
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace('/(authenticated)/history')}
        style={styles.tabItem}
      >
        <MaterialIcons
          name="calendar-today"
          size={24}
          color={isActive('/(authenticated)/history') ? '#2C7E88' : '#000'}
        />
        <Text style={isActive('/(authenticated)/history') ? styles.activeLabel : styles.label}>
          History
        </Text>
      </TouchableOpacity>

      {/* <TouchableOpacity
        onPress={() => router.replace('/(authenticated)/profile')}
      >
        <MaterialIcons name="person" size={28} />
      </TouchableOpacity>

      {user?.userClubRole?.[0]?.roleName !== 'ClubAdmin' && (
        <TouchableOpacity
          onPress={() => router.replace('/(authenticated)/find-players')}
        >
          <MaterialIcons name="group" size={28} />
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
