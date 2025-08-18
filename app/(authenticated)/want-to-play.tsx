import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import UserAvatar from '@/assets/UserAvatar';
import { useCreateIWantToPlay } from '@/hooks/apis/iwanttoplay/useCreateIWantToPlay';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';


const IWantToPlayScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [locationError, setLocationError] = useState('');
  const { createIWantToPlay } = useCreateIWantToPlay();

  const isValidLocation = (text: string) => {
    return /^[a-zA-Z0-9]/.test(text);
  };  

  const onBroadcastPress = async () => {
    if (!location.trim() || !message.trim() || locationError) {
      Alert.alert('Invalid Input', 'Please fix all fields before submitting.');
      return;
    }
  
    try {
      const response = await createIWantToPlay({
        userId: user?.userId,
        currentLocation: location,
        message,
        preferredPlayers: null,
      });
  
      console.log('Broadcast successful', response);
      Alert.alert('Success', 'Broadcast sent to all players.');
      setMessage('');
      setLocation('');
      router.push('/(authenticated)/home');
    } catch (error) {
      console.error('Broadcast failed', error);
      Alert.alert('Error', 'Failed to send broadcast.');
    }
  };
  
  const onPreferredPlayerPress = async () => {
    if (!location.trim() || !message.trim() || locationError) {
      Alert.alert('Invalid Input', 'Please fix all fields before submitting.');
      return;
    }
  
    const preferredPlayers = user?.playerDetails?.preferToPlayWith;
  
    if (!preferredPlayers || preferredPlayers.length === 0) {
      router.push('/preferred-players');
      return;
    }
  
    try {
      const response = await createIWantToPlay({
        userId: user?.userId,
        currentLocation: location,
        message,
        preferredPlayers: preferredPlayers,
      });

      console.log('Message Sent to preferred players successful', response);
      Alert.alert('Message sent to preferred players Successfully');
      setMessage('');
      setLocation('');
      router.push('/(authenticated)/home');
    } catch (error) {
      console.error('Error sending message to preferred players:', error);
      Alert.alert('Error', 'Failed to send message.');
    }
  };  
  
  console.log('Sending to API:', {
    userId: user?.userId,
    currentLocation: location,
    message,
    preferredPlayers: user?.playerDetails?.preferToPlayWith || null,
  });

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity
                onPress={() => router.replace('/(authenticated)/home')}
                style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#cce5e3" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>I Want To Play</Text>
              <Text style={styles.subtitle}>Send out message to players</Text>
            </View>
            <UserAvatar size={30} />
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Current Location</Text>
            <View style={styles.inputRow}>
              <TextInput
                placeholder="Enter Location"
                placeholderTextColor="#999"
                value={location}
                onChangeText={(text) => {
                  setLocation(text);
              
                  if (!isValidLocation(text)) {
                    setLocationError('invalid location entered');
                  } else {
                    setLocationError('');
                  }
                }}
                style={[styles.input, {flex:1,}]}
              />
              <Ionicons name="location-outline" size={20} color="#000" style={{marginLeft: 8,}}/>
            </View>
            {locationError !== '' && (
                <Text style={{ color: 'red', margin: 4 }}>{locationError}</Text>
              )}

            <Text style={[styles.label, { marginTop: 20 }]}>Enter Message</Text>
              <TextInput
                placeholder="Enter Message"
                placeholderTextColor="#999"
                value={message}
                onChangeText={(text) => {
                  if (text.length <= 500) {
                    setMessage(text);
                  }
                }}            
                multiline
                numberOfLines={4}
                style={styles.messageInput}
                textAlignVertical="top"
                scrollEnabled={true}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                {message.length >= 500 && (
                  <Text style={{ color: 'red' }}>
                    Message limit reached (500 characters)
                  </Text>
                )}
                <Text style={{ color: '#999' }}>{message.length} / 500</Text>
              </View>

            <View style= {styles.buttonsContainer}>
              <TouchableOpacity
                onPress={onBroadcastPress}
                style={[styles.button, {marginTop:20, backgroundColor: 'transparent',}]}
              >
                <Text style={[ styles.outlinedButtonText]}>
                  Broadcast to All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onPreferredPlayerPress}
                style={[styles.button, {backgroundColor: '#2F7C83',}]}
              >
                <Text style={[styles.filledButtonText]}>
                  Preferred Player
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

// Colors from the design
const primaryColor = '#2F7C83';
const white = '#fff';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primaryColor,
    paddingTop: 25,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },
  backButton: {
    paddingRight: 10,
    paddingVertical: 5,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    color: white,
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    marginTop: 4,
  },
  profilePicContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: white,
  },
  profilePic: {
    width: '100%',
    height: '100%',
  },
  card: {
    flex: 1,
    backgroundColor: white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 25,
    paddingHorizontal: 20,
    // paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
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
  input: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
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
  buttonsContainer: { 
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12, 
    paddingBottom: 4, 
    paddingTop: 5, 
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  button: {
    height: 45,
    borderRadius: 25,
    borderColor: '#2F7C83',
    borderWidth: 1,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlinedButtonText: {
    color: '#2F7C83',
    fontSize: 14,
    fontWeight: '500',
  },
  filledButtonText: {
    color: white,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default IWantToPlayScreen;