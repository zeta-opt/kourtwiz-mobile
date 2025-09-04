import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

type Props = {
  navigation: any; // Replace with proper navigation types if using React Navigation types
};

const dates = [
  { label: 'Today', date: '23 Jul' },
  { label: 'Thu', date: '24 Jul' },
  { label: 'Fri', date: '25 Jul' },
  { label: 'Sat', date: '26 Jul' },
  { label: 'Sun', date: '27 Jul' },
];

const durations = ['1 Hours', '2 Hours', '3 Hours', '4 Hours'];

const timeSlots = [
  '2:00 PM',
  '3:30 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:30 PM',
  '8:00 PM',
  '9:00 PM',
];

const BookCourtScreen: React.FC<Props> = ({ navigation }) => {
  const [players, setPlayers] = useState<number>(2);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [selectedDurationIndex, setSelectedDurationIndex] = useState<number>(1);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number | null>(null);

  const onBookNow = () => {
    // Handle booking action here
    // You can navigate to a confirmation screen or pass data back
    alert(`Booked for ${players} player(s), on ${dates[selectedDateIndex].label} ${dates[selectedDateIndex].date}, for ${durations[selectedDurationIndex]} starting at ${selectedTimeIndex !== null ? timeSlots[selectedTimeIndex] : 'N/A'}`);
  };

  const onInitiateRequest = (type: 'Player Finder' | 'Create Event') => {
    alert(`${type} button pressed`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(authenticated)/reserve')}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Court</Text>
        <View style={{ width: 40 }} /> 
        {/* Placeholder for user avatar or empty space */}
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Number of Players */}
        <Text style={styles.sectionTitle}>Number Of Players</Text>
        <View style={styles.row}>
          {[1, 2, 3, 4, 5].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.selectButton,
                players === num && styles.selectButtonSelected,
              ]}
              onPress={() => setPlayers(num)}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  players === num && styles.selectButtonTextSelected,
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Select Slot */}
        <Text style={styles.sectionTitle}>Select Slot</Text>
        <View style={styles.row}>
          {dates.map((date, i) => (
            <TouchableOpacity
              key={date.date}
              style={[
                styles.selectButton,
                selectedDateIndex === i && styles.selectButtonSelected,
              ]}
              onPress={() => setSelectedDateIndex(i)}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  selectedDateIndex === i && styles.selectButtonTextSelected,
                ]}
              >
                {date.label}
              </Text>
              <Text
                style={[
                  styles.selectButtonText,
                  selectedDateIndex === i && styles.selectButtonTextSelected,
                ]}
              >
                {date.date}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Select Duration */}
        <Text style={styles.sectionTitle}>Select Duration</Text>
        <View style={styles.row}>
          {durations.map((dur, i) => (
            <TouchableOpacity
              key={dur}
              style={[
                styles.selectButton,
                selectedDurationIndex === i && styles.selectButtonSelected,
              ]}
              onPress={() => setSelectedDurationIndex(i)}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  selectedDurationIndex === i && styles.selectButtonTextSelected,
                ]}
              >
                {dur}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Select Time From Available Slots */}
        <Text style={styles.sectionTitle}>Select Time From Available Slots</Text>
        <View style={styles.timeSlotsContainer}>
          {timeSlots.map((time, i) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeSlotButton,
                selectedTimeIndex === i && styles.timeSlotButtonSelected,
              ]}
              onPress={() => setSelectedTimeIndex(i)}
            >
              <Text
                style={[
                  styles.timeSlotText,
                  selectedTimeIndex === i && styles.timeSlotTextSelected,
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Initiate Request */}
        <Text style={styles.sectionTitle}>Initiate Request</Text>
        <View style={styles.initiateRequestRow}>
          <TouchableOpacity
            style={styles.initiateRequestButton}
            onPress={() => onInitiateRequest('Player Finder')}
          >
            <Text style={styles.initiateRequestText}>Player Finder</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.initiateRequestButton}
            onPress={() => onInitiateRequest('Create Event')}
          >
            <Text style={styles.initiateRequestText}>Create Event</Text>
          </TouchableOpacity>
        </View>

        {/* Book Now Button */}
        <TouchableOpacity style={styles.bookNowButton} onPress={onBookNow}>
          <Text style={styles.bookNowText}>Book Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const BUTTON_HEIGHT = 40;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectButton: {
    flex: 1,
    height: BUTTON_HEIGHT,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C9ECF0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  selectButtonSelected: {
    backgroundColor: '#E6FAFF',
    borderColor: '#2C7E88',
  },
  selectButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectButtonTextSelected: {
    color: '#333',
    fontWeight: '600',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlotButton: {
    width: '30%',
    marginVertical: 6,
    height: BUTTON_HEIGHT,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C9ECF0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeSlotButtonSelected: {
    backgroundColor: '#E6FAFF',
    borderColor: '#2C7E88',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: '#333',
    fontWeight: '600',
  },
  initiateRequestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  initiateRequestButton: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    height: BUTTON_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initiateRequestText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  bookNowButton: {
    marginTop: 32,
    backgroundColor: '#007AFF',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookNowText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookCourtScreen;