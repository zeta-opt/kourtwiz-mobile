import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';

export default function BookCourt() {
    const [selectedPlayers, setSelectedPlayers] = useState(1);
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
    const [selectedTime, setSelectedTime] = useState<number | null>(null);
    const [flowType, setFlowType] = useState<"find-player" | "create-event" | null>(null);
  
    const dates = [
        { label: "Wed", date: "24 Jul" },
        { label: "Thu", date: "25 Jul" },
        { label: "Fri", date: "26 Jul" },
      ];      
    const durations = ["1 hour", "2 hours", "3 hours", "4 hours"];
    const timeSlots = ["2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];
  
    const onBookNow = () => {
        if (!flowType) {
          Alert.alert("Select Flow", "Please choose Find Player or Create Event first.");
          return;
        }
        if (selectedDate === null || selectedDuration === null || selectedTime === null) {
          Alert.alert("Incomplete", "Please select date, duration and time.");
          return;
        }
      
        const rawDate = dates[selectedDate].date;
        const year = new Date().getFullYear();
        const parsedDate = new Date(`${rawDate} ${year}`);
        const formattedDate = `${parsedDate.getDate()}/${parsedDate.getMonth() + 1}/${parsedDate.getFullYear()}`; // "24/7/2025"
      
        const bookingDetails = {
          playersNeeded: selectedPlayers,
          datetime: [formattedDate, timeSlots[selectedTime]], // <-- array format [DD/MM/YYYY, "5:00 PM"]
          duration: durations[selectedDuration],
        };
      
        if (flowType === "find-player") {
          router.push({ pathname: "/(authenticated)/find-player", params: bookingDetails });
        } else {
          router.push({ pathname: "/(authenticated)/create-event", params: bookingDetails });
        }
    };

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Book Court</Text>
            <View style={{ width: 40 }} />
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
                selectedPlayers === num && styles.selectButtonSelected,
              ]}
              onPress={() => setSelectedPlayers(num)}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  selectedPlayers === num && styles.selectButtonTextSelected,
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
                selectedDate === i && styles.selectButtonSelected,
              ]}
              onPress={() => setSelectedDate(i)}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  selectedDate === i && styles.selectButtonTextSelected,
                ]}
              >
                {date.label}
              </Text>
              <Text
                style={[
                  styles.selectButtonText,
                  selectedDate === i && styles.selectButtonTextSelected,
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
                selectedDuration === i && styles.selectButtonSelected,
              ]}
              onPress={() => setSelectedDuration(i)}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  selectedDuration === i && styles.selectButtonTextSelected,
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
                selectedTime === i && styles.timeSlotButtonSelected,
              ]}
              onPress={() => setSelectedTime(i)}
            >
              <Text
                style={[
                  styles.timeSlotText,
                  selectedTime === i && styles.timeSlotTextSelected,
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
            style={[
            styles.initiateRequestButton,
            flowType === "find-player" && styles.initiateRequestButtonSelected,
            ]}
            onPress={() => setFlowType("find-player")}
        >
            <Text
            style={[
                styles.initiateRequestText,
                flowType === "find-player" && styles.initiateRequestTextSelected,
            ]}
            >
            Player Finder
            </Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={[
            styles.initiateRequestButton,
            flowType === "create-event" && styles.initiateRequestButtonSelected,
            ]}
            onPress={() => setFlowType("create-event")}
        >
            <Text
            style={[
                styles.initiateRequestText,
                flowType === "create-event" && styles.initiateRequestTextSelected,
            ]}
            >
            Open Play
            </Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  initiateRequestButton: {
    flex: 1,
    marginHorizontal: 8,
    height: BUTTON_HEIGHT,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C9ECF0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  initiateRequestButtonSelected: {
    backgroundColor: "#E6FAFF",
    borderColor: "#2C7E88",
  },
  initiateRequestText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  initiateRequestTextSelected: {
    color: "#2C7E88",
    fontWeight: "600",
  },
  bookNowButton: {
    marginTop: 32,
    backgroundColor: '#2C7E88',
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