import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import UserAvatar from '@/assets/UserAvatar';
import { getToken} from '@/shared/helpers/storeToken';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Constants from 'expo-constants';

const PREFERRED_TIMES = ['Morning', 'Afternoon', 'Evening', 'Anytime'];
type UserData = {
    name: string;
    email: string;
    phoneNumber: string;
    preferredTime: string;
  };

const PreferredTimeScreen = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
    const [userData, setUserData] = useState<UserData>({
        name: '',
        email: '',
        phoneNumber: '',
        preferredTime: '',
        });
    const [selectedTime, setSelectedTime] = useState(userData.preferredTime || '');

    useEffect(() => {
        const fetchProfile = async () => {
          try {
            const token = await getToken();
      
            // Step 1: Get the logged-in user metadata
            const meRes = await fetch(`${BASE_URL}/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
      
            if (!meRes.ok) throw new Error('Failed to fetch user metadata');
            const meData = await meRes.json();
      
            // Step 2: Fetch full user profile using userId
            const profileRes = await fetch(`${BASE_URL}/users/${meData.userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
      
            if (!profileRes.ok) throw new Error('Failed to fetch full user profile');
            const profileData = await profileRes.json();
      
            console.log('📥 Full user profile:', profileData);
      
            // Step 3: Update state
            setUserData(profileData);
            setSelectedTime(profileData.preferredTime || ''); // Set initial selection
          } catch (err) {
            console.error('❌ Error fetching profile:', err);
            Alert.alert('Error', 'Failed to load profile. Please try again.');
          }
        };
      
        fetchProfile();
      }, [BASE_URL]);
      

    
    const handleSavePreferredTime = async () => {
    if (!selectedTime || !user) return;

    try {
        const token = await getToken();

        const payload = {
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        preferredTime: selectedTime,
        };

        const response = await fetch(`${BASE_URL}/users/${user.userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to update preferred time');

        Alert.alert('Success', 'Preferred time updated successfully');
        router.replace('/profile');
    } catch (err) {
        console.error('❌ Error updating preferred time:', err);
        Alert.alert('Error', 'Failed to update preferred time');
    }
    };

  const renderItem = ({ item }: { item: string }) => {
    const isSelected = item === selectedTime;
    return (
      <TouchableOpacity
        style={styles.optionItem}
        onPress={() => setSelectedTime(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.optionText}>
          {item}
        </Text>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && (
            <Ionicons name="checkmark" size={18} color="white" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.replace('/profile')} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Preferred Time</Text>
            <UserAvatar size={32} onPress={() => console.log('Clicked Avatar')} />
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>Preferred Time</Text>

        {/* Options list */}
        <View style={styles.optionsContainer}>
            <FlatList
            data={PREFERRED_TIMES}
            renderItem={renderItem}
            keyExtractor={(item) => item}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            scrollEnabled={false}
            />
        </View>

      {/* Footer Done button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.doneButton} onPress={handleSavePreferredTime}>
            <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PreferredTimeScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
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
    margin: 20,
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  optionsContainer: {
    margin: 20,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 3,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  optionItemSelected: {
    backgroundColor: '#e6f3f1',
  },
  optionText: {
    fontSize: 16,
    color: '#222',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  doneButton: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#2F7C83',
    borderRadius: 25,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});