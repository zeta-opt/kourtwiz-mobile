import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import UserAvatar from '@/assets/UserAvatar';
import { useCreateIWantToPlay } from '@/hooks/apis/iwanttoplay/useCreateIWantToPlay';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useSearchImport } from '@/hooks/apis/iwanttoplay/useSearchImport';

const IWantToPlayScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [locationError, setLocationError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { createIWantToPlay } = useCreateIWantToPlay();

  // Hook to fetch location suggestions
  const {
    data: suggestionsData,
    status: suggestionsStatus,
  } = useSearchImport({
    search: location,
    userId: user?.userId,
    page: 0,
    size: 5,
  });

  const suggestions = suggestionsData?.content || [];

  // Auto-fill current location on mount
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Permission to access location was denied');
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        const addresses = await Location.reverseGeocodeAsync(loc.coords);

        if (addresses.length > 0) {
          const addr = addresses[0];
          // Combine street, postalCode, city, region, country if available
          const fullAddress = [
            addr.name,
            addr.street,
            addr.postalCode,
            addr.city,
            addr.region,
            addr.country 
          ]
            .filter(Boolean)
            .join(', ');

          setLocation(fullAddress);
        } else {
          setLocation(`${loc.coords.latitude}, ${loc.coords.longitude}`);
        }
      } catch (error) {
        setLocationError('Failed to get location');
      }
    })();
  }, []);

  const isValidLocation = (text: string) => /^[a-zA-Z0-9]/.test(text);

  const onSendPress = async () => {
    if (!location.trim() || !message.trim() || locationError) {
      Alert.alert('Invalid Input', 'Please fix all fields before submitting.');
      return;
    }

    const payload = {
      userId: user?.userId,
      skillLevel: user.playerDetails?.personalRating ?? 0,
      currentLocation: location,
      message,
    };

    console.log("📤 Sending Payload:", payload);

    try {
      const response = await createIWantToPlay(payload);

      console.log("✅ Broadcast Response:", response);

      Alert.alert('Success', 'Broadcast sent to all players.');

      setMessage('');
      setLocation('');
      setShowSuggestions(false);
      router.push('/(authenticated)/home');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      Alert.alert('Error', 'Failed to send message.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setShowSuggestions(false); }} accessible={false}>
        <View style={{ flex: 1 }}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#cce5e3" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>I Want To Play</Text>
              <Text style={styles.subtitle}>Send out message to players</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(authenticated)/profile')}>
              <UserAvatar size={30} />
            </TouchableOpacity>
          </View>

          {/* CARD */}
          <View style={styles.card}>
            {/* LOCATION */}
            <Text style={styles.label}>Current Location</Text>
            <View style={styles.inputRow}>
              <TextInput
                placeholder="Enter Location"
                placeholderTextColor="#999"
                value={location}
                onChangeText={(text) => {
                  setLocation(text);
                  if (!isValidLocation(text)) setLocationError('invalid location entered');
                  else setLocationError('');
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  setLocation('');
                  if (!location) setShowSuggestions(true);
                }}
                style={[styles.input, { flex: 1 }]}
                autoCorrect={false}
              />
              <Ionicons name="location-outline" size={20} color="#000" style={{ marginLeft: 8 }} />
            </View>
            {locationError !== '' && (
              <Text style={{ color: 'red', margin: 4 }}>{locationError}</Text>
            )}

            {showSuggestions &&
              suggestionsStatus === 'success' &&
              suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView keyboardShouldPersistTaps="handled">
                    {suggestions.map((item: any, index: number) => {
                      return (
                        <TouchableOpacity
                          key={item.id || index}
                          style={styles.suggestionItem}
                          onPress={() => {
                            setLocation(item.Location || item.Name || '');
                            setShowSuggestions(false);
                            setLocationError('');
                          }}
                        >
                          <Text style={styles.suggestionText}>
                            {item.Name} – {item.Location}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
            )}

            {/* MESSAGE */}
            <Text style={[styles.label, { marginTop: 20 }]}>Enter Message</Text>
            <TextInput
              placeholder="Enter Message"
              placeholderTextColor="#999"
              value={message}
              onChangeText={(text) => {
                if (text.length <= 500) setMessage(text);
              }}
              multiline
              numberOfLines={4}
              style={styles.messageInput}
              textAlignVertical="top"
              scrollEnabled
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              {message.length >= 500 && (
                <Text style={{ color: 'red' }}>Message limit reached (500 characters)</Text>
              )}
              <Text style={{ color: '#999' }}>{message.length} / 500</Text>
            </View>

            {/* SEND BUTTON */}
          <View style={styles.sendButtonContainer}>
            <TouchableOpacity
              onPress={onSendPress}
              style={styles.sendButton}
              activeOpacity={0.9}
            >
              <Text style={styles.sendButtonText}>Broadcast to All</Text>
            </TouchableOpacity>
          </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const primaryColor = '#2F7C83';
const white = '#fff';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: primaryColor, paddingTop: 25 },
  header: { flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 15, alignItems: 'center' },
  backButton: { paddingRight: 10, paddingVertical: 5 },
  headerTextContainer: { flex: 1 },
  title: { color: white, fontSize: 18, fontWeight: '600' },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4 },
  card: {
    flex: 1,
    backgroundColor: white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 25,
    paddingHorizontal: 20,
  },
  label: { fontSize: 14, color: '#000', fontWeight: '500' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    height: 45,
  },
  input: { flex: 1, fontSize: 14, color: '#000' },
  messageInput: {
    height: 300,
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    fontSize: 14,
    color: '#000',
  },
  dropdownInput: {
    height: 45,
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownWrapper: {
    position: 'relative',
  },
  dropdownList: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    maxHeight: 150,
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    zIndex: 1000,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 12 },
  dropdownItemText: { color: '#000', fontSize: 14 },
  dropdownDivider: { height: 1, backgroundColor: '#eee' },
  sendButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  sendButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: { color: white, fontSize: 14, fontWeight: '600' },

  // Styles for suggestions dropdown
  suggestionsContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 150,
    zIndex: 1200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  suggestionItem: {
    padding: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  suggestionText: {
    color: '#000',
    fontSize: 14,
  },
});

export default IWantToPlayScreen;
