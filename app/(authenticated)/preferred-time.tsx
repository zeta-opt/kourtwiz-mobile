import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import UserAvatar from '@/assets/UserAvatar';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetUserDetails } from '@/hooks/apis/player-finder/useGetUserDetails';
import { useUpdateUserById } from '@/hooks/apis/user/useUpdateUserById';

const PREFERRED_TIMES = ['Morning', 'Afternoon', 'Evening', 'Anytime'];

const PreferredTimeScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // fetch profile
  const { data: userData, status } = useGetUserDetails({
    userId: user?.userId ?? '',
    enabled: !!user?.userId,
  });

  const { updateUserById, status: updateStatus } = useUpdateUserById();
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  // sync local state when userData changes
  useEffect(() => {
    if (userData?.preferredTime) {
      setSelectedTimes(userData.preferredTime);
    }
  }, [userData]);

  const toggleTime = (time: string) => {
    setSelectedTimes((prev) => {
      if (time === "Anytime") {
        if (prev.includes("Anytime")) {
          return [];
        } else {
          return [...PREFERRED_TIMES];
        }
      } else {
        let updated = prev.includes(time)
          ? prev.filter((t) => t !== time)
          : [...prev, time];
  
        if (!["Morning", "Afternoon", "Evening"].every((t) => updated.includes(t))) {
          updated = updated.filter((t) => t !== "Anytime");
        }

        if (["Morning", "Afternoon", "Evening"].every((t) => updated.includes(t))) {
          updated = [...new Set([...updated, "Anytime"])];
        }
  
        return updated;
      }
    });
  };
  

    const handleSavePreferredTime = async () => {
    if (!user?.userId) return;

    try {
      const payload = {
        ...userData,
        preferredTime: selectedTimes,
      };

      await updateUserById(user.userId, payload);
      Alert.alert('Success', 'Preferred time updated successfully');
      router.replace('/profile');
    } catch (err) {
      Alert.alert('Error', 'Failed to update preferred time');
    }
  };

  const renderItem = ({ item }: { item: string }) => {
    const isSelected = selectedTimes.includes(item);
    return (
      <TouchableOpacity
        style={styles.optionItem}
        onPress={() => toggleTime(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.optionText}>{item}</Text>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={18} color="white" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace('/profile')}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferred Time</Text>
        <UserAvatar size={32} onPress={() => console.log('Clicked Avatar')} />
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Preferred Time</Text>

      {/* Options list */}
      <View style={styles.optionsContainer}>
        {status === 'loading' ? (
          <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#2C7E88" />
          </View>
        ) : (
          <FlatList
            data={PREFERRED_TIMES}
            renderItem={renderItem}
            keyExtractor={(item) => item}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Footer Done button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.doneButton, (updateStatus === 'loading' || status === 'loading') && { opacity: 0.5 }]}
          onPress={handleSavePreferredTime}
          disabled={updateStatus === 'loading' || status === 'loading'}
        >
          <Text style={styles.doneButtonText}>
            {updateStatus === 'loading' ? 'Saving...' : 'Done'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PreferredTimeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 12,
  },
  backButton: {
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    marginHorizontal: 20,
    marginVertical: 10,
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  optionsContainer: {
    margin: 20,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    borderRadius: 12,
  },
  optionItemSelected: {
    backgroundColor: '#e6f3f1',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2F7C83',
    borderColor: '#2F7C83',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  doneButton: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#2F7C83',
    borderRadius: 25,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});