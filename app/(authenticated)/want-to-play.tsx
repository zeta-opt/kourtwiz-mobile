import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import UserAvatar from '@/assets/UserAvatar';

const IWantToPlayScreen = () => {
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');

  const onBroadcastPress = () => {
    // Handle broadcast to all
  };

  const onPreferredPlayerPress = () => {
    // Handle preferred player action
  };

  return (
    <SafeAreaView style={styles.container}>
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
            onChangeText={setLocation}
            style={styles.input}
          />
          <Ionicons name="location-outline" size={20} color="#000" style={{marginLeft: 8,}}/>
        </View>

        <Text style={[styles.label, { marginTop: 20 }]}>Enter Message</Text>
        <TextInput
          placeholder="Enter Message"
          placeholderTextColor="#999"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
          style={[styles.input, styles.messageInput]}
          textAlignVertical="top"
        />
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
    </SafeAreaView>
  );
};

// Colors from the design
const primaryColor = '#50A4AF';
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
    height: 100,
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    fontSize: 14,
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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