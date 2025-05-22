import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import BottomTabs from '../../components/layout/BottomTabs';
import SideDrawer from '../../components/layout/SideDrawer';

export default function AuthenticatedLayout() {
  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }} />
      <SideDrawer />
      <BottomTabs />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
