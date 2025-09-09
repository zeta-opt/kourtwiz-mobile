import Constants from 'expo-constants';
import Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSignup } from '../SignupContext';

interface DoneStepProps {
  onRetry: (stepIndex: number) => void;
}

const DoneStep = ({ onRetry }: DoneStepProps) => {
  const { data } = useSignup();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryStep, setRetryStep] = useState<number | null>(null);
  const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

  useEffect(() => {
    if (!data.email || !data.phone) {
      console.error('Missing required fields: email or phone');
      setError('Missing required fields. Please go back and try again.');
      setRetryStep(0);
      setLoading(false);
      return;
    }

    const payload = {
      email: data.email,
      name: data.fullName,
      password: data.password,
      phoneNumber: data.phone,
      dateOfBirth: `${data.dob.year}-05-12`,
      preferredTime: data.preferredTime,
      gender: data.gender,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      zipCode: data.zip,
      playerDetails: {
        isAppDownloaded: true,
        personalRating: data.rating || 1,
        preferPlacesToPlay: data?.preferredPlaces?.map((id: string) => ({
          id: id,
        })),
      },
    };

    console.log('Sending signup payload:', payload);

    fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        console.log('Signup API response status:', res.status);

        if (res.status === 409) {
          throw new Error('EMAIL_ALREADY_EXISTS');
        }

        if (!res.ok) {
          throw new Error('SIGNUP_FAILED');
        }

        return res.json();
      })
      .then(async (responseJson) => {
        console.log('Signup API success:', responseJson);
        setSuccess(true);
        setLoading(false);

        // Get device token after successful signup
        try {
          let token;
          if (Platform.OS === 'ios') {
            token = (await Notifications.getDevicePushTokenAsync()).data;
          } else {
            token = (await Notifications.getExpoPushTokenAsync()).data;
          }
          console.log(token, 'device token');

          // TODO: Need to make another API call here to update the user's device token
        } catch (tokenError) {
          console.error('Failed to get device token:', tokenError);
          // Don't fail the signup process if we can't get the token
        }
      })
      .catch((err) => {
        console.error('Signup API error:', err);

        if (err.message === 'EMAIL_ALREADY_EXISTS') {
          setError('An account already exists with this email address.');
          setRetryStep(1);
        } else {
          setError(
            'Signup failed. Please check if all the required fields are filled, or call support.'
          );
          setRetryStep(0);
        }

        setLoading(false);
      });
  }, [data, BASE_URL]);

  const handleGoBack = () => {
    if (retryStep !== null) {
      onRetry(retryStep);
    }
  };

  const handleDone = () => {
    if (success) {
      router.push('/login');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Done</Text>
      <View style={styles.card}>
        {loading ? (
          <>
            <ActivityIndicator size='large' color='#116AAD' />
            <Text style={styles.infoText}>Creating Profile...</Text>
            <View style={[styles.doneBtn, { backgroundColor: '#ccc' }]}>
              <Text style={styles.doneText}>Done</Text>
            </View>
          </>
        ) : success ? (
          <>
            <Image
              source={require('../assets/success-check.png')}
              style={styles.icon}
            />
            <Text style={styles.successText}>Your profile is ready.</Text>
            <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.errorText}>❌ {error}</Text>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: '#FF5252' }]}
              onPress={handleGoBack}
            >
              <Text style={styles.doneText}>Go Back</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default DoneStep;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#116AAD',
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
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 12,
    color: '#333',
  },
  successText: {
    fontSize: 16,
    marginVertical: 12,
    color: '#2e7d32',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    marginVertical: 12,
    color: 'red',
    textAlign: 'center',
  },
  doneBtn: {
    backgroundColor: '#3F7CFF',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
  },
  doneText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
