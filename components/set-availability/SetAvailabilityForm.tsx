import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Button,
  Platform,
  Pressable,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import UserAvatar from '@/assets/UserAvatar';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import { useSetUnavailability } from '@/hooks/apis/set-availability/useSetUnavailability';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import AvailabilityCalendar from './AvailabilityCalendar';
import { useUpdatetUnavailability } from '@/hooks/apis/set-availability/useUpdateUnavailability';
type UnavailabilityData = {
  reason: string;
  startTime: string;
  endTime: string;
  eventRepeatType: 'NONE' | 'DAILY' | 'WEEKLY' | 'DAYS' | 'MONTHLY';
  repeatEndDate: string;
  repeatInterval: number;
  repeatOnDays: string[];
  repeatOnDates: string[];
};

type ScheduleEvent = {
  sessionId: string;
  title: string;
  reason: string;
  startTime: string;
  endTime: string;
};
type PropsForm = {
  event: ScheduleEvent | null; // null for new slot
  onClose: () => void;
  onSave: () => void; // callback to refresh calendar after save/update
};
export default function SetAvailabilityForm({ event, onClose, onSave }: PropsForm) {
  const isEditing = !!event?.sessionId;

  const [reason, setReason] = useState(event?.reason || '');
  const [startDate, setStartDate] = useState(event ? new Date(event.startTime) : new Date());
  const [endDate, setEndDate] = useState(event ? new Date(event.endTime) : new Date());
  const [allDay, setAllDay] = useState(false);
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
  const [repeatInterval, setRepeatInterval] = useState('1');
  const [repeatEndDate, setRepeatEndDate] = useState<Date | null>(null);
  const [showRepeatEndDatePicker, setShowRepeatEndDatePicker] = useState(false); 
  const [repeat, setRepeat] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customRepeatDays, setCustomRepeatDays] = useState<string[]>([]);
  const [customRepeatDates, setCustomRepeatDates] = useState<Date[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);

  const { data } = useLocalSearchParams();
  // console.log("whole data", data)

    const formatDateToLocalISOString = (date: Date) => {
    const pad = (num: number) => String(num).padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000`;
  };
    const [customRepeat, setCustomRepeat] = useState<
      'daily' | 'weekly' | 'monthly' | 'yearly'
    >('daily');
    const DAYS = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const [customInterval, setCustomInterval] = useState(1);
    const user = useSelector((state: RootState) => state.auth.user);
    const userId = user?.userId;
    const { updateUnavailability, status: updateStatus, error: updateError } = useUpdatetUnavailability(userId);

    const { setUnavailability, status, error } = useSetUnavailability(userId);



const showStartTimePicker = () => setStartTimePickerVisible(true);
const hideStartTimePicker = () => setStartTimePickerVisible(false);
const handleStartTimeConfirm = (time: Date) => {
  const newDate = new Date(startDate);
  newDate.setHours(time.getHours(), time.getMinutes(), 0);
  setStartDate(newDate);
  hideStartTimePicker();
};

const showEndTimePicker = () => setEndTimePickerVisible(true);
const hideEndTimePicker = () => setEndTimePickerVisible(false);
const handleEndTimeConfirm = (time: Date) => {
  const newDate = new Date(endDate);
  newDate.setHours(time.getHours(), time.getMinutes(), 0);
  setEndDate(newDate);
  hideEndTimePicker();
};

const showStartDatePicker = () => setStartDatePickerVisible(true);
const hideStartDatePicker = () => setStartDatePickerVisible(false);
const handleStartDateConfirm = (date: Date) => {
  const updated = new Date(startDate);
  updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
  setStartDate(updated);
  hideStartDatePicker();
};

const showEndDatePicker = () => setEndDatePickerVisible(true);
const hideEndDatePicker = () => setEndDatePickerVisible(false);
const handleEndDateConfirm = (date: Date) => {
  const updated = new Date(endDate);
  updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
  setEndDate(updated);
  hideEndDatePicker();
};
const handleUpdate = async () => {
  const payload = {
    sessionId: event!.sessionId,
    title: "what is this for",
    reason,
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString(),
  };

  console.log('Update payload:', payload);

  try {
    await updateUnavailability(payload);
    Alert.alert('Success', 'Event updated successfully!');
    onSave();
    onClose();
    router.replace("/(authenticated)/home");
  } catch (err) {
    console.error(err);
    Alert.alert('Error', 'Failed to update event');
  }
};


  const handleRepeatChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomModal(true);
    } else {
      setRepeat(value);
      setRepeatInterval('1');
      setRepeatEndDate(null);

      if (value === 'monthly') {
        const date = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          startTime?.getHours() || 0,
          startTime?.getMinutes() || 0
        );
        console.log('Adding monthly date:', date);
        setCustomRepeatDates((prev) => {
          const formattedDate = formatDateToLocalISOString(date);
          const exists = prev.some(
            (d) => formatDateToLocalISOString(d) === formattedDate
          );
          return exists ? prev : [...prev, date];
        });
      }
    }
};

  const formatDatesArray = (dates: Date[]) => dates.map(formatDateToLocalISOString);

    const handleCreate = async () => {
    const payload: UnavailabilityData = {
      reason,
      startTime: formatDateToLocalISOString(startDate),
      endTime: formatDateToLocalISOString(endDate),
      eventRepeatType: 'NONE',
      repeatEndDate: formatDateToLocalISOString(endDate),
      repeatInterval: 0,
      repeatOnDays: [],
      repeatOnDates: [],
    };

  // Handle repeat logic
  if (repeat && repeat.toUpperCase() !== 'NONE') {
    let eventRepeatType: UnavailabilityData['eventRepeatType'] = 'NONE';
    let repeatOnDays: string[] | undefined;
    let repeatOnDates: string[] | undefined;
    const interval = Number(customInterval || 0);

    if (repeat === 'custom') {
      switch (customRepeat) {
        case 'daily':
          eventRepeatType = 'DAILY';
          break;
        case 'weekly':
          eventRepeatType = 'WEEKLY';
          repeatOnDays = customRepeatDays;
          break;
        case 'monthly':
          eventRepeatType = 'MONTHLY';
          repeatOnDates = formatDatesArray(customRepeatDates);
          break;
      }
    } else {
      eventRepeatType = repeat.toUpperCase() as UnavailabilityData['eventRepeatType'];

      if (eventRepeatType === 'WEEKLY') {
        repeatOnDays = [
          startDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
        ];
      }

      if (eventRepeatType === 'MONTHLY') {
        const date = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
          startDate.getHours(),
          startDate.getMinutes()
        );
        repeatOnDates = [formatDateToLocalISOString(date)];
      }
    }

    payload.eventRepeatType = eventRepeatType;
    payload.repeatInterval = interval;

    if (repeatEndDate) {
      payload.repeatEndDate = formatDateToLocalISOString(repeatEndDate);
    }

    if (repeatOnDays) {
      payload.repeatOnDays = repeatOnDays;
    }

    if (repeatOnDates) {
      payload.repeatOnDates = repeatOnDates;
    }
  }

try {
      await setUnavailability(payload);
      console.log(payload)
      Alert.alert('Success', 'Event created successfully!');
      onSave();
      onClose();
      router.replace("/(authenticated)/home");
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to create event');
    }
  };

    const handleSubmit = () => {
    if (isEditing) handleUpdate();
    else handleCreate();
  };



    const handleCustomApply = () => {
    setRepeat('custom');
    setRepeatInterval(String(customInterval));
    setShowCustomModal(false);

    if (customRepeat === 'monthly') {
      const date = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        startTime?.getHours() || 0,
        startTime?.getMinutes() || 0
      );

      setCustomRepeatDates((prev) => {
        const formattedDate = formatDateToLocalISOString(date);
        const exists = prev.some(
          (d) => formatDateToLocalISOString(d) === formattedDate
        );
        return exists ? prev : [...prev, date];
      });
    }
  };




  return (
    <SafeAreaView>
        {/* Header */}
        
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace('/(authenticated)/home')}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#cce5e3" />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Set Availability</Text>
          </View>

          <UserAvatar size={30} />
        </View>

        {/* Scrollable Form */}
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* Reason Input */}
          <TextInput
            placeholder="Reason of unavailability..."
            placeholderTextColor="#888"
            style={styles.textArea}
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setReason}
          />

          {/* Card containing All Day toggle and Calendar */}
          <View style={styles.card}>
            {/* All Day Toggle */}
            <View style={styles.row}>
              <Text style={styles.label}>All Day</Text>
              <Switch
                value={allDay}
                onValueChange={setAllDay}
                trackColor={{ false: '#ccc', true: '#2F7C83' }}
                thumbColor="#fff"
              />
            </View>

            {/* Start Date/Time */}
            <View style={styles.row}>
              <Text style={styles.label}>Starts</Text>
              <Pressable onPress={showStartDatePicker}>
                <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
              </Pressable>
              {!allDay && (
                <Pressable onPress={showStartTimePicker}>
                  <Text style={styles.dateText}>
                    {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Pressable>
              )}
            </View>

            {/* End Date/Time */}
            <View style={styles.row}>
              <Text style={styles.label}>Ends</Text>
              <Pressable onPress={showEndDatePicker}>
                <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
              </Pressable>
              {!allDay && (
                <Pressable onPress={showEndTimePicker}>
                  <Text style={styles.dateText}>
                    {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Repeat Section */}
            <View style={styles.repeatSection}>
              <View style={styles.repeatRow}>
                <Text style={styles.label}>Repeat Event</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={repeat}
                    onValueChange={handleRepeatChange}
                    style={styles.picker}
                    itemStyle={{ color: '#000' }}
                  >
                    <Picker.Item label="None" value="NONE" />
                    <Picker.Item label="Daily" value="DAILY" />
                    <Picker.Item label="Weekly" value="WEEKLY" />
                    <Picker.Item label="Monthly" value="MONTHLY" />
                    <Picker.Item label="Custom" value="custom" />
                  </Picker>
                </View>
              </View>

              <TouchableOpacity onPress={() => setShowRepeatEndDatePicker(true)}>
                <Text style={styles.enddate}>
                  {repeatEndDate
                    ? `Repeat Ends: ${repeatEndDate.toDateString()}`
                    : 'Set Repeat End Date'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Done Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.doneButton} onPress={handleSubmit}>
              <Text style={styles.doneText}>{isEditing ? 'Update' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* DateTime Pickers */}
        <DateTimePickerModal
          isVisible={isStartDatePickerVisible}
          mode="date"
          date={startDate}
          onConfirm={handleStartDateConfirm}
          onCancel={hideStartDatePicker}
          display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
        />
        <DateTimePickerModal
          isVisible={isStartTimePickerVisible}
          mode="time"
          date={startDate}
          onConfirm={handleStartTimeConfirm}
          onCancel={hideStartTimePicker}
          display="spinner"
        />
        <DateTimePickerModal
          isVisible={isEndDatePickerVisible}
          mode="date"
          date={endDate}
          onConfirm={handleEndDateConfirm}
          onCancel={hideEndDatePicker}
          display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
        />
        <DateTimePickerModal
          isVisible={isEndTimePickerVisible}
          mode="time"
          date={endDate}
          onConfirm={handleEndTimeConfirm}
          onCancel={hideEndTimePicker}
          display="spinner"
        />

        <DateTimePickerModal
          isVisible={showRepeatEndDatePicker}
          mode="date"
          date={repeatEndDate || new Date()}
          onConfirm={(date) => {
            setRepeatEndDate(date);
            setShowRepeatEndDatePicker(false);
          }}
          onCancel={() => setShowRepeatEndDatePicker(false)}
          display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
        />


        <Modal visible={showCustomModal} animationType='slide' transparent>
          <View style={styles.overlay}>
            <View style={styles.modalWrapper}>
              <View style={styles.containerModal}>
                <Text style={styles.title}>Custom</Text>
                <ScrollView
                  contentContainerStyle={styles.containerModal}
                  keyboardShouldPersistTaps='handled'
                >
                  <Text style={styles.label}>Frequency</Text>
                  <View style={styles.pickerWrapper1}>
                    <Picker
                      selectedValue={customRepeat}
                      onValueChange={setCustomRepeat}
                      style={styles.picker}
                      itemStyle={{ color: '#000' }}
                    >
                      <Picker.Item label='Daily' value='daily' />
                      <Picker.Item label='Weekly' value='weekly' />
                      <Picker.Item label='Monthly' value='monthly' />
                    </Picker>
                  </View>

                  <Text style={styles.label}>Every</Text>
                  <View style={styles.pickerWrapper1}>
                    <Picker
                      selectedValue={customInterval}
                      onValueChange={(value) =>
                        setCustomInterval(Number(value))
                      }
                      style={styles.picker}
                      itemStyle={{ color: '#000' }}
                    >
                      {Array.from({ length: 30 }, (_, i) => (
                        <Picker.Item
                          key={i + 1}
                          label={`${i + 1} ${
                            customRepeat === 'daily'
                              ? 'Days'
                              : customRepeat === 'weekly'
                              ? 'Weeks'
                              : 'Months'
                          }`}
                          value={i + 1}
                        />
                      ))}
                    </Picker>
                  </View>

                  <Text style={styles.subText}>
                    Event will occur every {customInterval} {customRepeat}
                  </Text>

                  {customRepeat === 'weekly' && (
                    <View style={styles.dayList}>
                      {DAYS.map((day) => (
                        <TouchableOpacity
                          key={day}
                          onPress={() => {
                            setCustomRepeatDays((prev) =>
                              prev.includes(day.toUpperCase())
                                ? prev.filter((d) => d !== day.toUpperCase())
                                : [...prev, day.toUpperCase()]
                            );
                          }}
                          style={styles.dayRow}
                        >
                          <Text>{day}</Text>
                          <Text>
                            {customRepeatDays.includes(day.toUpperCase())
                              ? '🔘'
                              : '⚪️'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {customRepeat === 'monthly' && (
                    <View style={styles.calendarWrapper}>
                      <Calendar
                        onDayPress={(day) => {
                          const dateStr = day.dateString;
                          const selected = customRepeatDates.find((d) =>
                            formatDateToLocalISOString(d).startsWith(dateStr)
                          );

                          if (selected) {
                            setCustomRepeatDates((prev) =>
                              prev.filter(
                                (d) =>
                                  !formatDateToLocalISOString(d).startsWith(
                                    dateStr
                                  )
                              )
                            );
                          } else {
                            setCustomRepeatDates((prev) => [
                              ...prev,
                              new Date(
                                `${dateStr}T${startTime?.getHours() || 0}:${
                                  startTime?.getMinutes() || 0
                                }:00.00`
                              ),
                            ]);
                          }
                        }}
                        markedDates={customRepeatDates.reduce((acc, date) => {
                          const formatted =
                            formatDateToLocalISOString(date).split('T')[0];
                          acc[formatted] = {
                            selected: true,
                            selectedColor: '#00adf5',
                          };
                          return acc;
                        }, {} as Record<string, any>)}
                      />
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleCustomApply}
                  >
                    <Text style={styles.buttonText}>Customize</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowCustomModal(false)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </View>
        </Modal>

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF6F5',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerWrapper: {
  flex: 1,
  marginLeft: 12,
},

  repeatSection: {
    marginVertical: 12,
    },

    repeatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    },
   pickerWrapper1: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginVertical: 10,
  },
  calendarWrapper: {
    marginTop: 10,
  },
  modalWrapper: {
    width: '100%',
    maxHeight: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignSelf: 'center',
  },
  containerModal: {
    paddingTop: 20,
    paddingHorizontal: 20,
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    flexGrow: 1,
  },
  picker: {
    height: Platform.OS === 'ios' ? 200 : 70,
    width: '100%',
  },
   buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#888',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#2F7C83',
  },
  backButton: {
    paddingRight: 10,
    paddingVertical: 5,
  },
  headerTextContainer: {
    flex: 1,
  },
  subText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  dayList: {
    marginTop: 10,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007bff',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
    flex: 1,
  },
  textArea: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom:15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#333',
    fontWeight: '500',
    fontSize: 16,
  },
  dateText: {
    color: '#2F7C83',
    fontWeight: '500',
  },
  dropdown: {
    color: '#2F7C83',
    fontWeight: '500',
  },
  buttonContainer: {
    
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  doneButton: {
    backgroundColor: '#2F7C83',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  doneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  enddate: {
    marginBottom: 10,
    color: '#4ea0ac',
  },
});