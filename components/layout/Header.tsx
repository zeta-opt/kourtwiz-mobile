import { RootState } from '@/store';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Text, useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';

const Header = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const selectedClubname =
    user?.userClubRole?.find(
      (club: any) => club.clubId === user?.currentActiveClubId
    )?.clubName || 'Kourtwiz';

  return (
    <SafeAreaView>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.title}>{selectedClubname}</Text>
        <TouchableOpacity
          onPress={() => router.push('/(authenticated)/profile')}
        >
          <Avatar.Icon size={26} icon='account' style={styles.avatar} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: '10%',
    marginHorizontal: 1.5,
    height: 45,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatar: {
    backgroundColor: 'white',
  },
});

export default Header;
