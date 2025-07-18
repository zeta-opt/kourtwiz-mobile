// components/home-page/InvitationTopBar.tsx

import UserAvatar from '@/assets/UserAvatar';
import { RootState } from '@/store';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

const InvitationTopBar = ({
  active,
  inviteCount,
}: {
  active: 'all' | 'incoming' | 'sent' | 'open';
  inviteCount?: number;
}) => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.replace('/(authenticated)/home')}>
          <MaterialIcons name="arrow-back-ios" size={22} color="black" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Request</Text>

        <TouchableOpacity onPress={() => router.replace('/(authenticated)/home')}>
          <UserAvatar size={36} />
        </TouchableOpacity>
      </View>

      <View style={styles.chipRow}>
        <TouchableOpacity
          style={[styles.chip, active === 'all' && styles.activeChip]}
          onPress={() => router.replace('/home')}
        >
          <Text style={[styles.chipText, active === 'all' && styles.activeChipText]}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, active === 'incoming' && styles.activeChip]}
          onPress={() => router.replace('/player-invitations')}
        >
          <Text style={[styles.chipText, active === 'incoming' && styles.activeChipText]}>
            Incoming PF {inviteCount ? `(${inviteCount})` : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, active === 'sent' && styles.activeChip]}
          onPress={() => router.replace('/find-players')}
        >
          <Text style={[styles.chipText, active === 'sent' && styles.activeChipText]}>
            Sent Request
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, active === 'open' && styles.activeChip]}
          onPress={() => router.replace('/home')}
        >
          <Text style={[styles.chipText, active === 'open' && styles.activeChipText]}>Open Play</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default InvitationTopBar;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  chipRow: {
    flexDirection: 'row',
     justifyContent: 'center',
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#008080',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 6,
    backgroundColor: '#fff',
  },
  activeChip: {
    backgroundColor: '#008080',
  },
  chipText: {
    fontSize: 12,
    color: '#008080',
  },
  activeChipText: {
    color: '#fff',
  },
});
