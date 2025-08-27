import UserAvatar from '@/assets/UserAvatar';
import { useCreateOpenPlaySession } from '@/hooks/apis/createPlay/useCreateOpenPlay';
import { AppDispatch, RootState } from '@/store';
import {
  Contact,
  setPlaceToPlay,
  setPreferredContacts,
} from '@/store/playerFinderSlice';
import {
  closePreferredPlayersModal,
  openPreferredPlaceModal,
  openPreferredPlayersModal,
} from '@/store/uiSlice';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  LayoutChangeEvent,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Button, Icon, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import error_image from '../../assets/images/error_image.png';
import success_image from '../../assets/images/success_image.png';
import ContactsModal from '../find-player/contacts-modal/ContactsModal';
import PreferredPlacesModal from '../find-player/preferred-places-modal/PreferredPlacesModal';
import GameSchedulePicker from '../game-scheduler-picker/GameSchedulePicker';
import PreferredPlayersModal from '../preferred-players-modal/PreferredPlayersModal';
import PreferredPlayersSelector from '../preferred-players/PreferredPlayersSelector';
import RepeatPicker from './components/RepeatPicker';
import StatusModal from './components/StatusModal';
import EventNameSearch from './components/EventNameSearch';

const CreateEventForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId;
  const params = useLocalSearchParams();
  const [newPlaceData, setNewPlaceData] = useState<any>(null);

  const [eventName, setEventName] = useState('');
  const [place, setPlace] = useState('');
  const [court, setCourt] = useState('');
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customRepeatDays, setCustomRepeatDays] = useState<string[]>([]);
  const [customRepeatDates, setCustomRepeatDates] = useState<Date[]>([]);
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
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [showCustomModal, setShowCustomModal] = useState(false);
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
  const [modalVisible, setModalVisible] = useState(false);

  const sliderWidth = useRef(0);
  const animatedValue = useRef(new Animated.Value(skillLevel)).current;
  const [sliderPos, setSliderPos] = useState(0);
  const isInitialMount = useRef(true);
  const [errors, setErrors] = useState({
    eventName: false,
    placeToPlay: false,
    maxPlayers: false,
    date: false,
    startTime: false,
    endTime: false,
    repeat: false,
    repeatEndDate: false,
  });

  // Clear form data on component mount
  useEffect(() => {
    // Check if coming from AddPlace with new place data
    if (params.newPlace && params.placeName) {
      try {
        const parsedPlaceData = JSON.parse(params.newPlace as string);
        setNewPlaceData(parsedPlaceData);
        dispatch(setPlaceToPlay(params.placeName as string));
        // Clear params to prevent re-processing
        router.setParams({ newPlace: '', placeName: '' });
      } catch (error) {
        console.error('Error parsing new place data:', error);
      }
    } else {
      // Clear Redux state only if not coming from AddPlace
      dispatch(setPlaceToPlay(''));
      dispatch(setPreferredContacts([]));
      // Reset all form fields
      resetForm();
    }
  }, [params.newPlace, params.placeName, dispatch]); // Only watch these specific params

  // Function to reset form to initial state
  const resetForm = () => {
    setEventName('');
    setPlace('');
    setCourt('');
    setSelectedDate(new Date());
    setStartTime(null);
    setEndTime(null);
    setRepeat('');
    setRepeatEndDate(null);
    setSkillLevel(0);
    setPrice('');
    setMaxPlayers('');
    setDescription('');
    setCustomRepeatDays([]);
    setCustomRepeatDates([]);
    setRepeatInterval('1');
    setCustomInterval(1);
    setErrors({
      eventName: false,
      placeToPlay: false,
      date: false,
      maxPlayers: false,
      startTime: false,
      endTime: false,
      repeat: false,
      repeatEndDate: false,
    });
  };

  // Get display place name
  const displayPlaceName = newPlaceData?.Name || placeToPlay || '';

  const handleLayout = (e: LayoutChangeEvent) => {
    sliderWidth.current = e.nativeEvent.layout.width;
  };

  const handleValueChange = (value: number) => {
    setSkillLevel(value);
    animatedValue.setValue(value);
    const pos = (value / 5) * sliderWidth.current;
    setSliderPos(pos);
  };

  const preferredContacts = useSelector(
    (state: RootState) => state.playerFinder.preferredContacts
  );

  const { preferredPlaceModal } = useSelector((state: RootState) => state.ui);
  const { preferredPlayersModal } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionGranted(status === 'granted');
    };
    requestPermission();
  }, []);

  const showPreferredPlayers = () => {
    dispatch(openPreferredPlayersModal());
  };

  const handleAddContact = async () => {
    const { status } = await Contacts.getPermissionsAsync();
    if (status === 'granted') {
      setContactsModalVisible(true);
    } else {
      const { status: newStatus } = await Contacts.requestPermissionsAsync();

      if (newStatus === 'granted') {
        setContactsModalVisible(true);
      } else {
        Alert.alert(
          'Contacts Permission Required',
          'To select contacts from your device, we need access to your contacts.',
          [
            {
              text: "Don't Allow",
            },
            {
              text: 'Allow',
              onPress: async () => {
                const { status: finalStatus } =
                  await Contacts.requestPermissionsAsync();
                if (finalStatus === 'granted') {
                  setContactsModalVisible(true);
                } else {
                  Alert.alert(
                    'Permission Denied',
                    'You can still select players from your preferred contacts.'
                  );
                }
              },
            },
          ]
        );
      }
    }
  };

  const handleModalClose = (selectedPlace?: string) => {
    if (selectedPlace) {
      setPlaceToPlay(selectedPlace);
      // Clear newPlaceData when user selects a different place
      setNewPlaceData(null);
    }
    setModalVisible(false);
  };

  const handleRemovePlayer = (index: number) => {
    dispatch(
      setPreferredContacts(preferredContacts.filter((_, i) => i !== index))
    );
  };

  const handleSelectPlayers = (players: Contact[]) => {
    dispatch(setPreferredContacts(players));
  };

  const handleSelectContactsFromDevice = (contacts: Contact[]) => {
    dispatch(setPreferredContacts(contacts));
    setContactsModalVisible(false);
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

  const handleClubDetailsClick = async () => {
    // First check if we already have permission
    const { status: currentStatus } =
      await Location.getForegroundPermissionsAsync();

    if (currentStatus !== 'granted') {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermissionGranted(true);
        dispatch(openPreferredPlaceModal());
        Alert.alert(
          'Location Access Granted',
          'You can now search for nearby courts in addition to your preferred places!',
          [{ text: 'OK' }]
        );
      } else {
        setLocationPermissionGranted(false);
        dispatch(openPreferredPlaceModal());
        Alert.alert(
          'Location Access Denied',
          'You can still choose from your preferred places, but nearby court search will not be available.',
          [{ text: 'OK' }]
        );
      }
    } else {
      setLocationPermissionGranted(true);
      dispatch(openPreferredPlaceModal());
    }
  };

  const handleAddPlace = () => {
    router.push({
      pathname: '/(authenticated)/add-place',
      params: { source: 'create-event' },
    });
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

  const formatDatesArray = (dates: Date[]) =>
    dates.map(formatDateToLocalISOString);

  const handleSubmit = async () => {
    const newErrors = {
      eventName: !eventName,
      placeToPlay: !newPlaceData && !placeToPlay,
      maxPlayers: !maxPlayers,
      date: !selectedDate,
      startTime: !startTime,
      endTime: !endTime,
      repeat: !repeat,
      repeatEndDate: repeat !== 'NONE' && !repeatEndDate,
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    try {
      const durationMinutes = Math.floor(
        (endTime!.getTime() - startTime!.getTime()) / (1000 * 60)
      );

      const startDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        startTime!.getHours(),
        startTime!.getMinutes()
      );

      const payload: any = {
        eventName,
        ...(court?.trim() && { courtId: court.trim() }),
        ...(price?.trim() && { priceForPlay: Number(price) }),
        requestorId: userId,
        startTime: formatDateToLocalISOString(startDateTime),
        durationMinutes,
        skillLevel: Number(skillLevel.toFixed(2)),
        maxPlayers: Number(maxPlayers),
        description: description || undefined,
        allCourts: newPlaceData || {
          Name: placeToPlay,
        },
        ...(preferredContacts.length > 0 && {
          preferredPlayers: preferredContacts,
        }),
      };

      if (repeat && repeat.toUpperCase() !== 'NONE') {
        let eventRepeatType = '';
        let repeatOnDays: string[] | undefined;
        let repeatOnDates: string[] | undefined;

        const interval = Number(repeatInterval);

        if (repeat === 'custom') {
          if (customRepeat === 'daily') {
            eventRepeatType = 'DAILY';
          } else if (customRepeat === 'weekly') {
            eventRepeatType = 'DAYS';
            repeatOnDays = customRepeatDays;
          } else if (customRepeat === 'monthly') {
            eventRepeatType = 'MONTHLY';
            repeatOnDates = formatDatesArray(customRepeatDates);
          }
        } else {
          eventRepeatType = repeat.toUpperCase();

          if (repeat === 'WEEKLY') {
            repeatOnDays = [
              selectedDate
                .toLocaleDateString('en-US', {
                  weekday: 'long',
                })
                .toUpperCase(),
            ];
          }

          if (repeat === 'MONTHLY') {
            const date = new Date(
              selectedDate.getFullYear(),
              selectedDate.getMonth(),
              selectedDate.getDate(),
              startTime?.getHours() || 0,
              startTime?.getMinutes() || 0
            );
            repeatOnDates = [formatDateToLocalISOString(date)];
          }

          if (repeat === 'custom' && customRepeat === 'monthly') {
            repeatOnDates = formatDatesArray(customRepeatDates);
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

      await createSession(payload);
      setSuccessVisible(true);

      // Clear Redux state after successful submission
      dispatch(setPlaceToPlay(''));
      dispatch(setPreferredContacts([]));

      // Reset form and clear new place data
      resetForm();
      setNewPlaceData(null);

      console.log('Payload:', payload);
    } catch (err: any) {
      console.error('Error creating session:', err);
      setErrorMessage(err.message || 'Failed to create session');
      setErrorVisible(true);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1 }}>
          <View style={styles.mainHeader}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.replace('/(authenticated)/home')}
                style={styles.backButton}
              >
                <Ionicons name='arrow-back' size={24} color='#cce5e3' />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <Text style={styles.MainTitle}>Create Event</Text>
                <Text style={styles.subtitle}>
                  Fill out details to create an event
                </Text>
              </View>
              <UserAvatar size={30} />
            </View>
          </View>
          <ScrollView contentContainerStyle={styles.card}>
            <Text style={styles.label}>Event Name *</Text>
            <EventNameSearch
              value={eventName}
              onChange={setEventName}
              userId={userId || ''}
              error={errors.eventName}
              onSelect={(event) => {
                setEventName(event.eventName);
                setCourt(event.courtId || "");
                setPrice(event.priceForPlay?.toString() || "");
                setSkillLevel(event.skillLevel || 0);
                setMaxPlayers(event.maxPlayers?.toString() || "");
                setDescription(event.description || "");
                dispatch(setPlaceToPlay(event.allCourts?.Name || ""));
                if (event.preferredPlayers?.length > 0) {
                  dispatch(setPreferredContacts(event.preferredPlayers));
                }
              }}
/>

            <Text style={styles.label}>Club Name *</Text>
            <Text style={styles.buttonText}>{'Enter Place Name'}</Text>

            <View style={styles.inputRow}>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={{ flex: 1 }}
              >
                <TextInput
                  style={[
                    styles.input,
                    errors.placeToPlay && {
                      borderColor: 'red',
                      borderWidth: 1,
                    },
                  ]}
                  placeholder='Enter Place Name'
                  value={displayPlaceName}
                  editable={false}
                  pointerEvents='none'
                />
              </TouchableOpacity>

              <IconButton
                icon='plus'
                size={24}
                iconColor='white'
                onPress={handleAddPlace}
                style={styles.disabledPlus}
              />
            </View>
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
            <GameSchedulePicker
              selectedDate={selectedDate}
              startTime={startTime}
              endTime={endTime}
              onDateChange={setSelectedDate}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
              errors={{
                selectedDate: errors.date,
                startTime: errors.startTime,
                endTime: errors.endTime,
              }}
            />

            <Text style={styles.label}>Repeat Event *</Text>
            <View
              style={[
                errors.repeat && {
                  borderColor: 'red',
                  borderWidth: 1,
                  borderRadius: 5,
                },
              ]}
            >
              <RepeatPicker
                repeat={repeat}
                handleRepeatChange={handleRepeatChange}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Repeat End Date *</Text>
              <Button
                mode='outlined'
                style={[
                  styles.dateTimeButton,
                  styles.roundedButton,
                  styles.whiteButton,
                  styles.blackBorder,
                  errors.repeatEndDate && {
                    borderColor: 'red',
                    borderWidth: 1,
                  },
                ]}
                onPress={() => setShowRepeatEndDatePicker(true)}
                contentStyle={styles.fullWidth}
              >
                <View style={styles.buttonContent}>
                  <Text
                    style={[
                      styles.timeText,
                      { color: repeatEndDate ? '#000' : '#9F9F9F' },
                    ]}
                  >
                    {repeatEndDate
                      ? repeatEndDate.toLocaleDateString('en-GB')
                      : 'DD/MM/YYYY'}
                  </Text>
                  <Icon
                    source='calendar'
                    size={20}
                    color={repeatEndDate ? '#000' : '#9F9F9F'}
                  />
                </View>
              </Button>
            </View>

            {showRepeatEndDatePicker && (
              <DateTimePickerModal
                isVisible={showRepeatEndDatePicker}
                mode='date'
                onConfirm={(date) => {
                  setShowRepeatEndDatePicker(false);
                  setRepeatEndDate(date);
                }}
                onCancel={() => setShowRepeatEndDatePicker(false)}
                date={repeatEndDate || new Date()}
                display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                minimumDate={new Date(2000, 0, 1)}
                maximumDate={new Date(2100, 11, 31)}
              />
            )}

            <View style={styles.formSection}>
              <View style={styles.sliderSection}>
                <Text style={styles.skillLevelTitle}>Skill Level *</Text>
                <View onLayout={handleLayout} style={styles.sliderWrapper}>
                  <Animated.View
                    style={[styles.floatingLabel, { left: sliderPos - 10 }]}
                  >
                    <Text style={styles.floatingText}>
                      {skillLevel.toFixed(1)}
                    </Text>
                  </Animated.View>

                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={5}
                    step={0.1}
                    value={skillLevel}
                    minimumTrackTintColor='#007AFF'
                    maximumTrackTintColor='#E5E7EB'
                    thumbTintColor='#007AFF'
                    onValueChange={handleValueChange}
                  />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Price (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder='Enter Price'
                  value={price}
                  onChangeText={setPrice}
                  keyboardType='numeric'
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Max Players *</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.maxPlayers && { borderColor: 'red', borderWidth: 1 },
                  ]}
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
            <PreferredPlayersSelector
              preferredContacts={preferredContacts}
              onShowPreferredPlayers={showPreferredPlayers}
              onAddContact={handleAddContact}
              onRemovePlayer={handleRemovePlayer}
            />

            <PreferredPlayersModal
              visible={preferredPlayersModal}
              onClose={() => dispatch(closePreferredPlayersModal())}
              onSelectPlayers={handleSelectPlayers}
              selectedPlayers={preferredContacts}
            />

            <ContactsModal
              visible={contactsModalVisible}
              onClose={() => setContactsModalVisible(false)}
              onSelectContacts={handleSelectContactsFromDevice}
              selectedContacts={preferredContacts}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Create Event</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

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
        <StatusModal
          visible={successVisible}
          onClose={() => setSuccessVisible(false)}
          onButtonPress={() => {
            setSuccessVisible(false);
            router.replace('/(authenticated)/home');
          }}
          imageSource={success_image}
          title='Event Created Successfully!'
          description='You can now share the event, view details, or make changes anytime.'
          buttonText='Got It'
          buttonColor='#00796B'
        />

        <StatusModal
          visible={errorVisible}
          onClose={() => setErrorVisible(false)}
          imageSource={error_image}
          title='Event Not Created.'
          description='Please review your details and try again. If the issue continues, contact support.'
          buttonText='Try Again'
          buttonColor='#E53935'
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
    backgroundColor: '#51a4b0',
    borderRadius: 10,
    flexGrow: 1,
  },
  containerModal: {
    paddingTop: 20,
    paddingHorizontal: 20,
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 25,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modalWrapper: {
    width: '100%',
    maxHeight: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignSelf: 'center',
  },
  disabledPlus: {
    backgroundColor: '#2C7E88',
    marginTop: 8,
    borderRadius: 8,
    opacity: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainHeader: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    marginTop: 4,
  },
  enddate: {
    marginBottom: 10,
    color: '#4ea0ac',
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  MainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    color: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
    marginLeft: -8,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
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
    marginTop: 10,
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderColor: '#4ea0ac',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    color: '#4ea0ac',
    fontWeight: '600',
  },
  formSection: {
    marginBottom: 5,
  },
  sliderSection: {
    paddingHorizontal: 0,
  },
  skillLevelTitle: {
    marginBottom: 8,
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
  },
  sliderWrapper: {
    position: 'relative',
    height: 60,
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  dateTimeButton: {
    justifyContent: 'flex-start',
  },
  roundedButton: {
    borderRadius: 8,
  },
  whiteButton: {
    backgroundColor: '#fff',
  },
  blackBorder: {
    borderColor: '#000',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },

  fullWidth: {
    width: '100%',
  },
  timeText: {
    flex: 1,
    textAlign: 'left',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  floatingLabel: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#4ea0ac',
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  subText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  pickerWrapper1: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginVertical: 10,
  },
  picker: {
    height: Platform.OS === 'ios' ? 200 : 70,
    width: '100%',
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
  calendarWrapper: {
    marginTop: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007bff',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
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
  floatingText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  selectedValue: {
    marginTop: 8,
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  selectedSkillLevel: {
    marginTop: 8,
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#4ea0ac',
    borderRadius: 20,
    color: '#FFFFFF',
    paddingVertical: 12,
    paddingLeft: 0,
    alignItems: 'center',
  },
});

export default CreateEventForm;
