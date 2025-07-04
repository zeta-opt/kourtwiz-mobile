import { getToken } from '@/shared/helpers/storeToken';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { addMinutes, format, parse } from 'date-fns';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  courtId: string;
  courtName: string;
  userId: string;
  clubId: string;
  date: Date;
  startTime: string;
  onSuccess: () => void;
}

const durations = [30, 60];

const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  onClose,
  courtId,
  courtName,
  userId,
  clubId,
  date,
  startTime,
  onSuccess,
}) => {
  const [duration, setDuration] = useState(30);

  const handleBook = async () => {
    console.log('court ID', courtId, clubId, userId);

    const start = parse(
      `${format(date, 'yyyy-MM-dd')} ${startTime}`,
      'yyyy-MM-dd hh:mm a',
      new Date()
    );
    const end = addMinutes(start, duration);

    const body = {
      userId,
      clubId,
      courtId,
      date: format(date, 'yyyy-MM-dd'),
      startTime: format(start, 'HH:mm'),
      endTime: format(end, 'HH:mm'),
      participants: [userId],
    };

    try {
      const token = await getToken();
      if (!token) {
        console.error('❌ No token returned from getToken()');
        return;
      }
      console.log('✅ token', token);

      const res = await axios.post(
        'https://api.vddette.com/api/bookings',
        body,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('✅ booking success', res.data);
      onClose();
      onSuccess();
    } catch (err: any) {
      console.error('❌ Booking failed', err?.response?.data || err.message);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Book</Text>
          <Text>
            Date:{' '}
            <Text style={styles.bold}>{format(date, 'EEE MMM dd yyyy')}</Text>
          </Text>
          <Text>
            Start Time: <Text style={styles.bold}>{startTime}</Text>
          </Text>

          <Text style={{ marginTop: 10 }}>Select Duration:</Text>
          <Picker
            selectedValue={duration}
            onValueChange={(value) => setDuration(value)}
            style={styles.picker}
          >
            {durations.map((d) => (
              <Picker.Item key={d} label={`${d} minutes`} value={d} />
            ))}
          </Picker>

          <TouchableOpacity style={styles.bookBtn} onPress={handleBook}>
            <Text style={styles.bookBtnText}>Book for {duration} minutes</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  bold: { fontWeight: 'bold' },
  picker: { height: 50, width: '100%' },
  bookBtn: {
    marginTop: 20,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  bookBtnText: { color: '#fff', fontWeight: '600' },
  cancelBtn: { marginTop: 10, alignItems: 'center' },
});

export default BookingModal;
