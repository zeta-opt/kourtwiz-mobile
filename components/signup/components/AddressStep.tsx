import React, { useState } from 'react';
import {
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';
import { useSignup } from '../SignupContext';
import Constants from 'expo-constants';

const schema = z.object({
  zip: z.string().min(5, 'ZIP code is required'),
  address: z.string().min(1, 'Address is required'),
});

const AddressStep = ({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) => {
  const { data, updateData } = useSignup();
  const [zip, setZip] = useState(data.zip || '');
  const [address, setAddress] = useState(data.address || '');
  const [city, setCity] = useState(data.city || '');
  const [state, setState] = useState(data.state || '');
  const [country, setCountry] = useState(data.country || 'US');
  const [errors, setErrors] = useState<{ zip?: string; address?: string }>({});
  type Place = {
    id: string;
    name?: string;
    Name?: string;
  };
  
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [showPlaces, setShowPlaces] = useState(false);
  const handleZipLookup = async (zipCode: string) => {
    setZip(zipCode);
    if (zipCode.length === 5) {
      try {
        const res = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
        if (!res.ok) throw new Error('Invalid ZIP');
        const data = await res.json();
        const place = data.places[0];
        setCity(place['place name']);
        setState(place['state']);
        setCountry(data['country']);
      } catch (err) {
        Alert.alert(
          'ZIP Lookup Failed',
          'Invalid ZIP code or location not found'
        );
        setCity('');
        setState('');
        setCountry('US');
      }
    }
  };

  const fetchNearbyPlaces = async () => {
    try {
      const params = new URLSearchParams({
        address,
        city,
        state,
        zipCode: zip,
        country,
        maxDistanceInKm: '5',
        page: '0',
        limit: '10',
      });

      const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

      const res = await fetch(
        `${BASE_URL}/api/import/nearbyaddress?${params}`
      );
      if (!res.ok) throw new Error('Failed to fetch places');
      const data = await res.json();
      setNearbyPlaces(data);
      setShowPlaces(true);
    } catch (err) {
      Alert.alert('Error', 'Could not fetch preferred places');
    }
  };

  const handleNext = () => {
    if (!showPlaces) {
      const result = schema.safeParse({ zip, address });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
        Alert.alert('Validation Error', result.error.errors[0].message);
        return;
      }
      updateData({ zip, address, city, state, country });
      fetchNearbyPlaces();
    } else {
      console.log('selected Places : ', selectedPlaces);
      updateData({ preferredPlaces: selectedPlaces });
      onNext();
    }
  };

  const handleSelectPlace = (placeId:string) => {
    console.log('selecting place : ', placeId);
    setSelectedPlaces((prev) =>
      prev.includes(placeId)
        ? prev.filter((id) => id !== placeId)
        : [...prev, placeId]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#116AAD' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps='handled'
      >
        <Text style={styles.title}>Select Preferred Places!</Text>
        <View style={styles.card}>
          {!showPlaces ? (
            <>
              <Text style={styles.label}>ZIP Code</Text>
              <TextInput
                style={styles.input}
                value={zip}
                onChangeText={handleZipLookup}
                placeholder='ZIP Code'
                keyboardType='numeric'
                maxLength={5}
              />
              {errors.zip && <Text style={styles.errorText}>{errors.zip}</Text>}

              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder='Address'
              />
              {errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}

              <Text style={styles.label}>City</Text>
              <TextInput style={styles.input} value={city} editable={false} />

              <Text style={styles.label}>State</Text>
              <TextInput style={styles.input} value={state} editable={false} />

              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                value={country}
                editable={false}
              />
            </>
          ) : (
            <>
              {nearbyPlaces.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  onPress={() => handleSelectPlace(place.id)}
                  style={{
                    padding: 12,
                    backgroundColor: selectedPlaces.includes(place.id)
                      ? '#cde'
                      : 'transparent',
                  }}
                >
                  <Text>{place.Name || place.name}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          <View style={styles.buttonRow}>
            {!showPlaces && <Button title='Back' onPress={onBack} />}
            <Button
              title={showPlaces ? 'Confirm and Continue' : 'Next'}
              onPress={handleNext}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddressStep;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
    color: '#000',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
