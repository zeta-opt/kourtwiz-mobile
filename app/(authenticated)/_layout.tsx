import Header from '@/components/layout/Header';
import { Stack, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import BottomTabs from '../../components/layout/BottomTabs';
import SideDrawer from '../../components/layout/SideDrawer';
import { LinearGradient } from 'expo-linear-gradient';

export default function AuthenticatedLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const showHeader = pathname.includes('/home');

  return (
    <LinearGradient
      colors={['#E0F7FA', '#FFFFFF']} 
      style={styles.gradientBackground}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
          {showHeader  && <Header />}
          <Stack screenOptions={{ headerShown: false }} />
          <SideDrawer />
          {showHeader && <BottomTabs />}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent', // Let gradient show through
  },
  container: {
    flex: 1,
  },
});
