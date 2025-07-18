import { useCreateOpenPlaySession } from '@/hooks/apis/createPlay/useCreateOpenPlay';
import { RootState } from '@/store';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import PreferredPlacesModal from '../find-players/preferred-places-modal/PreferredPlacesModal';

const CreateEventForm = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId;

  const [eventName, setEventName] = useState('');
  const [place, setPlace] = useState('');
  const [court, setCourt] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [repeat, setRepeat] = useState('');
  const [skillLevel, setSkillLevel] = useState(0);
  const [price, setPrice] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [description, setDescription] = useState('');
  const { createSession } = useCreateOpenPlaySession();

  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState<{
    visible: boolean;
    type: 'start' | 'end';
  }>({ visible: false, type: 'start' });
  const { placeToPlay } = useSelector((state: RootState) => state.playerFinder);

  const [locationPermissionGranted, setLocationPermissionGranted] = useState<
    boolean | null
  >(null);
  const [repeatInterval, setRepeatInterval] = useState('1');
  const [repeatEndDate, setRepeatEndDate] = useState<Date | null>(null);
  const [showRepeatEndDatePicker, setShowRepeatEndDatePicker] = useState(false);

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customRepeat, setCustomRepeat] = useState<
    'daily' | 'weekly' | 'monthly' | 'yearly'
  >('daily');
  const [customInterval, setCustomInterval] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);

  const handleModalClose = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionGranted(status === 'granted');
    };
    requestPermission();
  }, []);

  const handleRepeatChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomModal(true);
    } else {
      setRepeat(value);
      setRepeatInterval('1');
      setRepeatEndDate(null);
    }
  };

  const handleCustomApply = () => {
    setRepeat(customRepeat);
    setRepeatInterval(String(customInterval));
    setShowCustomModal(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || repeatEndDate;
    setShowDatePicker(false);
    setRepeatEndDate(currentDate ?? null);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      if (showTimePicker.type === 'start') {
        setStartTime(selectedTime);
        const autoEnd = new Date(selectedTime.getTime() + 2 * 60 * 60 * 1000);
        setEndTime(autoEnd);
      } else {
        setEndTime(selectedTime);
      }
    }
    setShowTimePicker({ visible: false, type: 'start' });
  };

  const formatTime = (date?: Date | null) =>
    date
      ? date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
  console.log(placeToPlay);

  const formatDateToLocalISOString = (date: Date) => {
    const pad = (num: number) => String(num).padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // 0-based index
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000`;
  };

  const handleSubmit = async () => {
    if (!eventName || !placeToPlay || !date || !startTime || !endTime) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    try {
      const durationMinutes = Math.floor(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60)
      );

      const startDateTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        startTime.getHours(),
        startTime.getMinutes()
      );

      const payload: any = {
        playTypeName: eventName,
        courtId: court || undefined,
        requestorId: userId,
        startTime: formatDateToLocalISOString(startDateTime),
        durationMinutes,
        priceForPlay: Number(price),
        skillLevel: String(skillLevel),
        maxPlayers: Number(maxPlayers),
        eventRepeatType: repeat.toUpperCase() || 'NONE',
        ...(repeat &&
          repeat.toUpperCase() !== 'NONE' && {
            repeatInterval: Number(repeatInterval),
            repeatEndDate: repeatEndDate
              ? formatDateToLocalISOString(repeatEndDate)
              : undefined,
            ...(repeat.toLowerCase() === 'weekly' && {
              repeatOnDays: [date.getDay().toString()],
            }),
          }),
        description: description || undefined,
        allCourts: {
          Name: placeToPlay,
        },
      };

      await createSession(payload);
      Alert.alert('Success', 'Session created successfully');
      console.log(payload);
    } catch (err: any) {
      console.error('Error creating session:', err);
      Alert.alert('Error', err.message || 'Failed to create session');
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Event Name</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={eventName} onValueChange={setEventName}>
            <Picker.Item label='Select Event Type' value='' />
            <Picker.Item label='Open Play' value='OPEN_PLAY' />
            <Picker.Item label='Private Lesson' value='PRIVATE_LESSON' />
            <Picker.Item label='Group Lesson' value='GROUP_LESSON' />
            <Picker.Item label='Clinic' value='CLINIC' />
            <Picker.Item label='Tournament' value='TOURNAMENT' />
            <Picker.Item label='League' value='LEAGUE' />
          </Picker>
        </View>

        <Text style={styles.buttonText}>{'Enter Place Name'}</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <TextInput
            style={styles.input}
            placeholder='Enter Place Name'
            value={placeToPlay} // will show the selected place
            editable={false}
            pointerEvents='none'
          />
        </TouchableOpacity>

        <PreferredPlacesModal
          visible={modalVisible}
          handleClose={handleModalClose}
          locationPermissionGranted={locationPermissionGranted}
        />

        <Text style={styles.label}>Court Selection (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder='Enter Court Name'
          value={court}
          onChangeText={setCourt}
        />

        <Text style={styles.label}>Date</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <TextInput
            style={styles.input}
            value={date.toLocaleDateString()}
            editable={false}
          />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode='date'
            display='default'
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>Duration</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.timeInput}
            onPress={() => setShowTimePicker({ visible: true, type: 'start' })}
          >
            <Text>{formatTime(startTime) || 'Start Time'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.timeInput}
            onPress={() => setShowTimePicker({ visible: true, type: 'end' })}
          >
            <Text>{formatTime(endTime) || 'End Time'}</Text>
          </TouchableOpacity>
        </View>

        {showTimePicker.visible && (
          <DateTimePicker
            value={startTime || new Date()}
            mode='time'
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            is24Hour={false}
            onChange={handleTimeChange}
          />
        )}

        <Text style={{ fontWeight: 'bold' }}>Repeat:</Text>
        <Picker selectedValue={repeat} onValueChange={handleRepeatChange}>
          <Picker.Item label='None' value='none' />
          <Picker.Item label='Daily' value='daily' />
          <Picker.Item label='Weekly' value='weekly' />
          <Picker.Item label='Monthly' value='monthly' />
          <Picker.Item label='Yearly' value='yearly' />
          <Picker.Item label='Custom' value='custom' />
        </Picker>

        <TouchableOpacity onPress={() => setShowRepeatEndDatePicker(true)}>
          <Text style={{ color: '#007bff' }}>
            {repeatEndDate
              ? `Repeat Ends: ${repeatEndDate.toDateString()}`
              : 'Set Repeat End Date'}
          </Text>
        </TouchableOpacity>

        {showRepeatEndDatePicker && (
          <DateTimePicker
            value={repeatEndDate || new Date()}
            mode='date'
            display='default'
            onChange={(event, selectedDate) => {
              setShowRepeatEndDatePicker(false);
              if (selectedDate) setRepeatEndDate(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>Minimum Skill Level</Text>
        <Slider
          minimumValue={0}
          maximumValue={5}
          step={0.1}
          value={skillLevel}
          onValueChange={setSkillLevel}
          minimumTrackTintColor='#007bff'
          maximumTrackTintColor='#ccc'
          style={{ width: '100%' }}
        />
        <Text style={styles.sliderValue}>{skillLevel.toFixed(1)}</Text>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              placeholder='Enter Price'
              value={price}
              onChangeText={setPrice}
              keyboardType='numeric'
            />
          </View>

          <View style={styles.halfInput}>
            <Text style={styles.label}>Max Players</Text>
            <TextInput
              style={styles.input}
              placeholder='Enter Max Players'
              value={maxPlayers}
              onChangeText={setMaxPlayers}
              keyboardType='numeric'
            />
          </View>
        </View>

        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder='Add event details...'
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>
              Send to Preferred Player
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Create Event</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showCustomModal} animationType='slide'>
        <View style={{ padding: 20 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
            Custom Repeat
          </Text>

          <Text>Frequency:</Text>
          <Picker
            selectedValue={customRepeat}
            onValueChange={(value) => setCustomRepeat(value)}
          >
            <Picker.Item label='Daily' value='daily' />
            <Picker.Item label='Weekly' value='weekly' />
            <Picker.Item label='Monthly' value='monthly' />
            <Picker.Item label='Yearly' value='yearly' />
          </Picker>

          <Text>Repeat Every:</Text>
          <TextInput
            keyboardType='numeric'
            value={String(customInterval)}
            onChangeText={(text) => setCustomInterval(Number(text))}
            style={{ borderWidth: 1, padding: 5, marginVertical: 10 }}
          />

          <Text>End Date:</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={{ paddingVertical: 10 }}
          >
            <Text style={{ color: 'blue' }}>
              {repeatEndDate ? repeatEndDate.toDateString() : 'Select End Date'}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={repeatEndDate || new Date()}
              mode='date'
              display='default'
              onChange={handleDateChange}
            />
          )}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 20,
            }}
          >
            <Button title='Cancel' onPress={() => setShowCustomModal(false)} />
            <Button title='Apply' onPress={handleCustomApply} />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  halfInput: {
    flex: 1,
  },
  textArea: {
    height: 80,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  sliderValue: {
    alignSelf: 'flex-end',
    marginBottom: 12,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  secondaryButton: {
    borderColor: '#007bff',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    color: '#007bff',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#333',
  },
});

export default CreateEventForm;
