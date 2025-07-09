import { useFetchUser } from '@/hooks/apis/authentication/useFetchUser';
import useUpdateActiveClub from '@/hooks/apis/switchClubs/useUpdateActiveClub';
import { RootState } from '@/store';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';

type Props = {
  onCloseMenu?: () => void;
};

const SwitchClub = ({ onCloseMenu }: Props) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { updateClub, loading } = useUpdateActiveClub();
  const { fetchUser } = useFetchUser();
  const [selectedClub, setSelectedClub] = useState<string | null>(null);

  const prevClubIdRef = useRef(user?.currentActiveClubId);

  useEffect(() => {
    if (
      selectedClub &&
      user?.currentActiveClubId === selectedClub &&
      prevClubIdRef.current !== selectedClub
    ) {
      Alert.alert('Success', 'Switched club successfully');
      onCloseMenu?.(); // ✅ close menu on success
    }

    prevClubIdRef.current = user?.currentActiveClubId;
  }, [user?.currentActiveClubId]);

  const handleSwitchClub = async (clubId: string) => {
    if (clubId === user?.currentActiveClubId) return;

    try {
      setSelectedClub(clubId);
      await updateClub(clubId);
      await fetchUser();
    } catch (error) {
      Alert.alert('Error', 'Failed to switch club');
    } finally {
      setSelectedClub(null);
    }
  };

  return (
    <View style={styles.container}>
      {user?.userClubRole?.map((role: any) => {
        const isActive = role.clubId === user.currentActiveClubId;

        return (
          <Pressable
            key={role.clubId}
            style={[styles.clubItem, isActive && styles.activeClubItem]}
            onPress={() => handleSwitchClub(role.clubId)}
          >
            <View style={styles.textRow}>
              <Text style={[styles.clubText, isActive && styles.activeText]}>
                {role.clubName}
              </Text>
              <Text style={[styles.roleText, isActive && styles.activeText]}>
                ({role.roleName})
              </Text>
            </View>

            {selectedClub === role.clubId && loading && (
              <ActivityIndicator size='small' color='#000' />
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

export default SwitchClub;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  clubItem: {
    width: 220,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeClubItem: {
    backgroundColor: '#e0ecff',
    borderColor: '#3b82f6',
    borderWidth: 1,
  },
  textRow: {
    flexDirection: 'column',
  },
  clubText: {
    fontSize: 16,
    color: '#111827',
  },
  roleText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeText: {
    color: '#1d4ed8',
    fontWeight: 'bold',
  },
});
