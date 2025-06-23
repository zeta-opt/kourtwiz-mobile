import Header from '@/components/layout/Header';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import BottomTabs from '../../components/layout/BottomTabs';
import SideDrawer from '../../components/layout/SideDrawer';

export default function AuthenticatedLayout() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <Header />
        <Stack screenOptions={{ headerShown: false }} />
        <SideDrawer />
        <BottomTabs />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // Match your background color
  },
  container: {
    flex: 1,
  },
});
