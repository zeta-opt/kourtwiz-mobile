import { useCreateOpenPlaySession } from '@/hooks/apis/createPlay/useCreateOpenPlay';
import { AppDispatch, RootState } from '@/store';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import * as Contacts from 'expo-contacts';
import { useDispatch, useSelector } from 'react-redux';
import {
  Contact,
  loadContacts,
  resetPlayerFinderData,
  setPlaceToPlay,
  setPreferredContacts,
} from '@/store/playerFinderSlice';
import {
  Alert,
  Animated,
  Button,
  KeyboardAvoidingView,
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
import PreferredPlacesModal from '../find-player/preferred-places-modal/PreferredPlacesModal';
import { router } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import GameSchedulePicker from '../game-scheduler-picker/GameSchedulePicker';
import PreferredPlayersSelector from '../preferred-players/PreferredPlayersSelector';
import PreferredPlayersModal from '../preferred-players-modal/PreferredPlayersModal';
import ContactsModal from '../find-player/contacts-modal/ContactsModal';
import { closePreferredPlayersModal, openPreferredPlayersModal } from '@/store/uiSlice';
import { Calendar } from 'react-native-calendars';
import { IconButton } from 'react-native-paper';
import UserAvatar from '@/assets/UserAvatar';

const CreateEventForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId;

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

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customRepeat, setCustomRepeat] = useState<
    'daily' | 'weekly' | 'monthly' | 'yearly'
  >('daily');
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [customInterval, setCustomInterval] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  
  const sliderWidth = useRef(0);
  const animatedValue = useRef(new Animated.Value(skillLevel)).current;
  const [sliderPos, setSliderPos] = useState(0);

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
  console.log(preferredContacts);

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
    }
  };

  const handleCustomApply = () => {
    setRepeat(customRepeat);
    setRepeatInterval(String(customInterval));
    setShowCustomModal(false);
  };

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
  useEffect(() => {
  if (customRepeat === 'monthly') {
    const now = new Date();
    setCustomRepeatDates([
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        startTime?.getHours(),
        startTime?.getMinutes()
      ),
    ]);
  }
}, [customRepeat, startTime]);
  const handleSubmit = async (sendToPreferredPlayers: boolean = false) => {
    if (!eventName || !placeToPlay || !date || !startTime || !endTime) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    try {
      const durationMinutes = Math.floor(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60)
      );
      

      const startDateTime = new Date( 
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        startTime.getHours(),
        startTime.getMinutes()
      );
      const formatDatesArray = (dates: Date[]) =>
      dates.map(formatDateToLocalISOString);

     const payload: any = {
      eventName,
      ...(court?.trim() && { courtId: court.trim() }),
      ...(price?.trim() && { priceForPlay: Number(price) }),
      requestorId: userId,
      startTime: formatDateToLocalISOString(startDateTime),
      durationMinutes,
      skillLevel: Number(skillLevel.toFixed(2)),
      maxPlayers: Number(maxPlayers),
      eventRepeatType:
        repeat === 'custom'
          ? (customRepeat === 'weekly' ? 'DAYS' : customRepeat.toUpperCase())
          : repeat.toUpperCase(),

      ...(repeat && repeat.toUpperCase() !== 'NONE' && {
        repeatInterval: Number(repeatInterval),
        repeatEndDate: repeatEndDate
          ? formatDateToLocalISOString(repeatEndDate)
          : undefined,

        ...(repeat === 'custom' && customRepeat === 'weekly' && {
          repeatOnDays: customRepeatDays,
        }),

        ...(repeat === 'custom' && customRepeat === 'monthly' && {
          repeatOnDates: formatDatesArray(customRepeatDates),
        }),

        ...(repeat === 'monthly' && {
          repeatOnDates: [
            formatDateToLocalISOString(
              new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate(),
                startTime.getHours(),
                startTime.getMinutes()
              )
            ),
          ],
        }),

        ...(repeat === 'weekly' && {
          repeatOnDays: [
            selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
            }).toUpperCase(),
          ],
        }),
      }),

      description: description || undefined,
      allCourts: {
        Name: placeToPlay,
      },

      ...(preferredContacts.length > 0 && {
        preferredPlayers: preferredContacts,
      }),
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
    <SafeAreaView style={styles.container}>
    <View style={{ flex: 1}}>
     <View style={styles.mainHeader}>
        <View style={styles.header}>
        <TouchableOpacity
            onPress={() => router.replace('/(authenticated)/home')}
            style={styles.backButton}
        >
            <Ionicons name="arrow-back" size={24} color="#cce5e3" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.MainTitle}>Create Event</Text>
          <Text style={styles.subtitle}>Fill out details to create an event</Text>
        </View>
        <UserAvatar size={30} />
      </View>
      </View>
      <ScrollView contentContainerStyle={styles.card} >
        <Text style={styles.label}>Event Name</Text>
        <TextInput
          style={styles.input}
          placeholder='Enter Event Name'
          value={eventName}
          onChangeText={setEventName}
        />

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
        <GameSchedulePicker
          selectedDate={selectedDate}
          startTime={startTime}
          endTime={endTime}
          onDateChange={setSelectedDate}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
        />
        <Text style={styles.label}>Repeat Event</Text>
        <Picker selectedValue={repeat} onValueChange={handleRepeatChange}>
          <Picker.Item label='None' value='NONE' />
          <Picker.Item label='Daily' value='DAILY' />
          <Picker.Item label='Weekly' value='WEEKLY' />
          <Picker.Item label='Monthly' value='MONTHLY' />
          <Picker.Item label='Custom' value='custom' />
        </Picker>

        <TouchableOpacity onPress={() => setShowRepeatEndDatePicker(true)}>
          <Text style={styles.enddate}>
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

        <View style={styles.formSection}>
          <View style={styles.sliderSection}>
            <Text style={styles.skillLevelTitle}>
              Skill Level
            </Text>
            <View onLayout={handleLayout} style={styles.sliderWrapper}>

              <Animated.View
                style={[styles.floatingLabel, { left: sliderPos - 10 }]}
              >
                <Text style={styles.floatingText}>{skillLevel.toFixed(1)}</Text>
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
          onPress={() => handleSubmit}
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
        keyboardShouldPersistTaps="handled"
      >
          <Text style={styles.label}>Frequency</Text>
          <View style={styles.pickerWrapper1}>
            <Picker
              selectedValue={customRepeat}
              onValueChange={setCustomRepeat}
              style={styles.picker}
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
              onValueChange={(value) => setCustomInterval(Number(value))}
              style={styles.picker}
            >
              {Array.from({ length: 30 }, (_, i) => (
                <Picker.Item
                  key={i + 1}
                  label={`${i + 1} ${customRepeat === 'daily' ? 'Days' : customRepeat === 'weekly' ? 'Weeks' : 'Months'}`}
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
                  <Text>{customRepeatDays.includes(day.toUpperCase()) ? '🔘' : '⚪️'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

            {customRepeat === 'monthly' && (
              <View style={styles.calendarWrapper}>
                <Calendar
                  onDayPress={(day) => {
                  const dateStr = day.dateString;
                  const selected = customRepeatDates.find(d =>
                    formatDateToLocalISOString(d).startsWith(dateStr)
                  );

                  if (selected) {
                    setCustomRepeatDates(prev =>
                      prev.filter(d => !formatDateToLocalISOString(d).startsWith(dateStr))
                    );
                  } else {
                    setCustomRepeatDates(prev => [
                      ...prev,
                      new Date(`${dateStr}T09:00:00.000Z`)
                    ]);
                  }
                }}
                />
              </View>
            )}
          <TouchableOpacity style={styles.button} onPress={handleCustomApply}>
            <Text style={styles.buttonText}>Customize</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCustomModal(false)} >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          </ScrollView>
    
        </View>
        </View>
      </View>
    </Modal>
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
  gap:8,
  backgroundColor:'#51a4b0',
  borderRadius: 10,
  flexGrow: 1,
},
containerModal:{
  paddingTop: 20,
  paddingHorizontal:20,
  gap:8,
  backgroundColor:'#fff',
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
  marginVertical: 40,
  width: '100%',
  minHeight:'90%',
},
overlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  
},
    mainHeader: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomLeftRadius:15,
      borderBottomRightRadius:15,
    },
    subtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    marginTop: 4,
  },
    enddate:{
      marginBottom:10,
      color:'#4ea0ac',
    },
  
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      alignSelf:'center',
    },
    MainTitle:{
      fontSize: 16,
      fontWeight: 'bold',
      alignSelf:'flex-start',
      color:'#fff',
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
    fontSize:24,
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
    fontWeight:500,
  },
  sliderWrapper: {
    position: 'relative',
    height: 60,
    justifyContent: 'center',
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
    marginVertical: 8,
  },
  pickerWrapper1: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginVertical: 10,
  },
  picker: {
    height: 70,
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
    color:'#FFFFFF',
    paddingVertical: 12,
    paddingLeft:0,
    alignItems: 'center',
  },
});

export default CreateEventForm;
