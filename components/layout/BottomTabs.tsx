import { RootState } from '@/store';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDrawer } from '../../store/uiSlice';
import { useTheme } from 'react-native-paper';

export default function BottomTabs() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const hasRoles = user?.userClubRole?.length > 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderColor: colors.outline,
        },
      ]}
    >
      {hasRoles && (
        <TouchableOpacity onPress={() => dispatch(toggleDrawer())}>
          <MaterialIcons name="menu" size={28} color={colors.onBackground} />
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => router.replace('/(authenticated)/home')}>
        <MaterialIcons name="home" size={28} color={colors.onBackground} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace('/(authenticated)/profile')}
      >
        <MaterialIcons name="person" size={28} color={colors.onBackground} />
      </TouchableOpacity>

      {user?.userClubRole?.[0]?.roleName !== 'ClubAdmin' && (
        <TouchableOpacity
          onPress={() => router.replace('/(authenticated)/find-players')}
        >
          <MaterialIcons name="group" size={28} color={colors.onBackground} />
        </TouchableOpacity>
      )}
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
  },
});
