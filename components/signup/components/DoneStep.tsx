import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useSignup } from '../SignupContext';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

const DoneStep = () => {
  const { data } = useSignup();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!data.email || !data.phone) {
      console.error('Missing required fields: email or phone');
      setError(true);
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
      },
    };

    console.log('Sending signup payload:', payload);

    fetch('http://44.216.113.234:8080/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        console.log('Signup API response status:', res.status);
        if (!res.ok) throw new Error('Signup failed');
        return res.json();
      })
      .then((responseJson) => {
        console.log('Signup API success:', responseJson);
        setSuccess(true);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Signup API error:', err);
        setLoading(false);
        setError(true);
      });
  }, []);

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
            <ActivityIndicator size="large" color="#116AAD" />
            <Text style={styles.infoText}>Creating Profile...</Text>
            <View style={[styles.doneBtn, { backgroundColor: '#ccc' }]}>              
              <Text style={styles.doneText}>Done</Text>
            </View>
          </>
        ) : success ? (
          <>
            <Image source={require('../assets/success-check.png')} style={styles.icon} />
            <Text style={styles.successText}>Your profile is ready.</Text>
            <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>              
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.errorText}>❌ Error during signup. Please contact the administrator or call support.</Text>
            <View style={[styles.doneBtn, { backgroundColor: '#ccc' }]}>              
              <Text style={styles.doneText}>Done</Text>
            </View>
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