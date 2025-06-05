import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSignup } from '../SignupContext';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const PictureStep = ({ onNext, onBack }) => {
  const { updateData } = useSignup();
  const [imageUri, setImageUri] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [rating, setRating] = useState(0);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      updateData({ profileImage: uri });
    }
  };

  const handleNext = () => {
    updateData({ preferredTime: selectedTime, rating });
    onNext();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Picture</Text>

      <View style={styles.card}>
        <TouchableOpacity onPress={handleImagePick} style={styles.imagePicker}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Ionicons name="person-circle-outline" size={80} color="#aaa" />
          )}
          <Text style={styles.uploadText}>Upload Photo</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Preferred Play Time</Text>
        <View style={styles.buttonRow}>
          {['Morning', 'Afternoon', 'Evening'].map((time) => (
            <TouchableOpacity
              key={time}
              style={[styles.timeBtn, selectedTime === time && styles.timeBtnSelected]}
              onPress={() => setSelectedTime(time)}
            >
              <Text
                style={[styles.timeText, selectedTime === time && styles.timeTextSelected]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Player Rating</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={32}
                color={star <= rating ? '#FFD700' : '#ccc'}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.navigationRow}>
          <Button title="Back" onPress={onBack} />
          <Button title="Next" onPress={handleNext} />
        </View>
      </View>
    </View>
  );
};

export default PictureStep;

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
    padding: 20,
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  uploadText: {
    color: '#3F7CFF',
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeBtn: {
    flex: 1,
    marginHorizontal: 4,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  timeBtnSelected: {
    backgroundColor: '#3F7CFF',
  },
  timeText: {
    color: '#333',
    fontWeight: '600',
  },
  timeTextSelected: {
    color: '#fff',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
});