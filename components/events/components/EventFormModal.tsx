// components/EventFormModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';

import uuid from 'react-native-uuid';
import { format, isValid } from 'date-fns';
import { Portal } from 'react-native-paper';
import { useCalendarContext } from '../CalendarContext';

const genderOptions = ['Male', 'Female', 'Any'];
const courtOptions = ['Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court 5', 'Court 6', 'Court 7', 'Court 8'];
const repeatOptions = ['one-time', 'weekly'];

const EventFormModal = () => {
  const {
    openModal,
    setOpenModal,
    selectedDate,
    selectedEvent,
    events,
    setEvents,
  } = useCalendarContext();

  const [title, setTitle] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Any'>('Any');
  const [court, setCourt] = useState<string>('Court 1');
  const [skillLevel, setSkillLevel] = useState<number>(1);
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [recurrence, setRecurrence] = useState<'one-time' | 'weekly'>('one-time');

  useEffect(() => {
    if (selectedEvent) {
      setTitle(selectedEvent.title);
      setGender(selectedEvent.gender);
      setCourt(selectedEvent.courts[0] || 'Court 1');
      setSkillLevel(selectedEvent.skillLevel);
      setMaxPlayers(selectedEvent.maxPlayers);
      setRecurrence((selectedEvent.recurrence as 'one-time' | 'weekly') || 'one-time');
    } else {
      setTitle('');
      setGender('Any');
      setCourt('Court 1');
      setSkillLevel(1);
      setMaxPlayers(4);
      setRecurrence('one-time');
    }
  }, [selectedEvent]);

  const handleSubmit = () => {
    const event = {
      id: selectedEvent?.id || uuid.v4().toString(),
      title,
      startDate: new Date(selectedDate),
      endDate: new Date(new Date(selectedDate).getTime() + 60 * 60 * 1000),
      courts: [court],
      gender,
      skillLevel,
      maxPlayers,
      participants: selectedEvent?.participants || [],
      recurrence,
    };

    const updated = selectedEvent
      ? events.map(e => (e.id === event.id ? event : e))
      : [...events, event];

    setEvents(updated);
    setOpenModal(false);
  };

  return (
    <Portal>
      <Modal visible={openModal} animationType="slide">
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.label}>Event Name</Text>
          <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="Enter title" />

          <Text style={styles.label}>Date</Text>
          <Text style={styles.textDisplay}>
            {isValid(new Date(selectedDate))
              ? format(new Date(selectedDate), 'eeee, MMM d, yyyy - hh:mm a')
              : 'Invalid Date'}
          </Text>

          <Text style={styles.label}>Gender</Text>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={gender} onValueChange={(value) => setGender(value)}>
              {genderOptions.map(opt => (
                <Picker.Item key={opt} label={opt} value={opt} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Court</Text>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={court} onValueChange={(value) => setCourt(value)}>
              {courtOptions.map(opt => (
                <Picker.Item key={opt} label={opt} value={opt} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Skill Level ({skillLevel})</Text>
          <Slider
            style={{ width: '100%' }}
            minimumValue={1}
            maximumValue={10}
            step={0.5}
            value={skillLevel}
            onValueChange={(value) => setSkillLevel(value)}
          />

          <Text style={styles.label}>Repeat</Text>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={recurrence} onValueChange={(value) => setRecurrence(value)}>
              {repeatOptions.map(opt => (
                <Picker.Item key={opt} label={opt === 'one-time' ? 'One Time' : 'Weekly'} value={opt} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Max Players</Text>
          <TextInput
            value={maxPlayers.toString()}
            onChangeText={(v) => setMaxPlayers(Number(v))}
            keyboardType="numeric"
            style={styles.input}
          />

          <View style={styles.buttonRow}>
            <Button title="Save" onPress={handleSubmit} color="#4CAF50" />
            <Button title="Cancel" onPress={() => setOpenModal(false)} color="red" />
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 15,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 5,
  },
  textDisplay: {
    fontSize: 16,
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f4f4f4',
    borderRadius: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default EventFormModal;
