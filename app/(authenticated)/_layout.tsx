import Header from '@/components/layout/Header';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import BottomTabs from '../../components/layout/BottomTabs';
import SideDrawer from '../../components/layout/SideDrawer';
import { useTheme } from 'react-native-paper';
export default function AuthenticatedLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
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
    // backgroundColor: '#fff', // Match your background color
  },
  container: {
    flex: 1,
  },
});
