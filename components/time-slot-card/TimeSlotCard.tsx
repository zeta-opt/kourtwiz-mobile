import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BookingModal from '../booking-modal/BookingModal';


interface TimeSlotCardProps {
  time: string;
  court: string;
  courtId: string;
  isBooked: boolean;
  date: Date;
  userId: string;
  clubId: string;
  onBooked: () => void;
}

const TimeSlotCard: React.FC<TimeSlotCardProps> = ({
  time,
  court,
  courtId,
  isBooked,
  date,
  userId,
  clubId,
  onBooked,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = () => {
    if (!isBooked) setModalVisible(true);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.time}>{time}</Text>
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.button, isBooked && styles.bookedButton]}
        disabled={isBooked}
      >
        <Text style={styles.buttonText}>{isBooked ? 'Booked' : 'Reserve'}</Text>
      </TouchableOpacity>

      <BookingModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        courtId={courtId}
        courtName={court}
        userId={userId}
        clubId={clubId}
        date={date}
        startTime={time}
        onSuccess={() => {
          setModalVisible(false);
          onBooked();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  time: { fontSize: 16 },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bookedButton: {
    backgroundColor: 'red',
  },
  buttonText: { color: '#fff' },
});

export default TimeSlotCard;