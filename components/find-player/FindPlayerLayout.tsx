import UserAvatar from '@/assets/UserAvatar';
import { useRequestPlayerFinder } from '@/hooks/apis/player-finder/useRequestPlayerFinder';
import { useUpdatePlayerFinderEvent } from '@/hooks/apis/player-finder/useUpdateInvite';
import { AppDispatch, RootState } from '@/store';
import {
  Contact,
  loadContacts,
  resetPlayerFinderData,
  setPlaceToPlay,
  setPreferredContacts,
} from '@/store/playerFinderSlice';
import { triggerInvitationsRefetch } from '@/store/refetchSlice';
import {
  closePreferredPlaceModal,
  closePreferredPlayersModal,
  openPreferredPlaceModal,
  openPreferredPlayersModal,
} from '@/store/uiSlice';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  Dialog,
  Icon,
  IconButton,
  Portal,
  Text,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import GameSchedulePicker from '../game-scheduler-picker/GameSchedulePicker';
import PlayerCountDropdown from '../player-count/PlayerCountDropdown';
import PreferredPlayersModal from '../preferred-players-modal/PreferredPlayersModal';
import PreferredPlayersSelector from '../preferred-players/PreferredPlayersSelector';
import ContactsModal from './contacts-modal/ContactsModal';
import EventNameSearch from './event-name-search/EventNameSearch';
import PreferredPlacesModal from './preferred-places-modal/PreferredPlacesModal';

// Define the PlaceToSave type based on the payload structure
interface PlaceToSave {
  id?: string;
  netType: string;
  noOfCourts: number;
  openingTime: string;
  closingTime: string;
  isFree: boolean;
  membership: string;
  isRestRoomAvailable: boolean;
  isCarParkingAvailable: boolean;
  creatorId: string;
  isPrivate: boolean;
  geoLocation?: {
    x: number;
    y: number;
    type: string;
    coordinates: number[];
  };
  SN?: number;
  Access?: string;
  'Court Purpose'?: string;
  'Court Type'?: string;
  Latitude?: number;
  Lighting: string;
  Location: string;
  Longitude?: number;
  Name: string;
  'Booking Link'?: string;
}

const FindPlayerLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useLocalSearchParams();
  // Explicitly derive editMode from params
  const isEditMode = params?.isEditMode === 'true';
  const finderId = params?.finderId as string | undefined;
  console.log('params received in the layout', params);

  // Get user from Redux
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId;

  // State management
  const [eventName, setEventName] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [skillLevel, setSkillLevel] = useState(
    user?.playerDetails?.personalRating ?? 3
  );
  const [playerCount, setPlayerCount] = useState(1);
  const [conflictDialogVisible, setConflictDialogVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Add state for placeToSave
  const [placeToSave, setPlaceToSave] = useState<PlaceToSave | null>(null);

  // Add the hook for player finder
  const { requestPlayerFinder, status: finderStatus } =
    useRequestPlayerFinder();
  const {
    updateEvent,
    status: editStatus,
    error: editError,
  } = useUpdatePlayerFinderEvent(() => dispatch(triggerInvitationsRefetch()));

  const preferredContacts = useSelector(
    (state: RootState) => state.playerFinder.preferredContacts
  );
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<
    boolean | null
  >(null);

  const { preferredPlaceModal } = useSelector((state: RootState) => state.ui);
  const { preferredPlayersModal } = useSelector((state: RootState) => state.ui);
  const { placeToPlay } = useSelector((state: RootState) => state.playerFinder);

  // Handle data from AddPlace when returning
  useEffect(() => {
    if (params.newPlace && params.placeName) {
      try {
        const newPlaceData = JSON.parse(params.newPlace as string);

        // Transform the data to match PlaceToSave structure
        const transformedPlace: PlaceToSave = {
          Name: newPlaceData.Name,
          Location: newPlaceData.Location,
          'Court Type': newPlaceData['Court Type'],
          netType: newPlaceData.netType,
          noOfCourts: newPlaceData.noOfCourts,
          openingTime: newPlaceData.openingTime,
          closingTime: newPlaceData.closingTime,
          isFree: newPlaceData.isFree,
          membership: newPlaceData.membership,
          Lighting: newPlaceData.Lighting,
          isRestRoomAvailable: newPlaceData.isRestRoomAvailable,
          isCarParkingAvailable: newPlaceData.isCarParkingAvailable,
          creatorId: newPlaceData.creatorId,
          isPrivate: newPlaceData.isPrivate,
        };

        setPlaceToSave(transformedPlace);
        dispatch(setPlaceToPlay(params.placeName as string));
      } catch (error) {
        console.error('Error parsing new place data:', error);
      }
    }
  }, [params.newPlace, params.placeName]);

  // Check location permission status on mount
  useEffect(() => {
    checkLocationPermission();
  }, []);

  useEffect(() => {
    dispatch(loadContacts());
  }, [dispatch]);

  const resetForm = () => {
    setEventName('');
    setSelectedDate(null);
    setStartTime(null);
    setEndTime(null);
    setSkillLevel(user?.playerDetails?.personalRating ?? 3);
    setPlayerCount(1);
    setSubmitted(false);
    setPlaceToSave(null);
    setContactsModalVisible(false);

    dispatch(setPlaceToPlay(''));
    dispatch(setPreferredContacts([]));
    dispatch(resetPlayerFinderData());
  };

  const checkLocationPermission = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setLocationPermissionGranted(status === 'granted');
  };

  const arrayToDate = (arr: number[] | string | undefined): Date | null => {
    if (!arr) return null;
    if (typeof arr === 'string') return new Date(arr);
    if (arr.length >= 5) {
      return new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5] || 0);
    }
    return null;
  };

  useEffect(() => {
    if (!isEditMode || !params) return;

    console.log('Edit mode params:', params);

    // Place - Only dispatch if the value is different
    if (
      params.placeToPlay &&
      typeof params.placeToPlay === 'string' &&
      placeToPlay !== params.placeToPlay
    ) {
      dispatch(setPlaceToPlay(params.placeToPlay));
    }

    // Players needed
    if (params.playersNeeded && typeof params.playersNeeded === 'string') {
      const newPlayerCount = Number(params.playersNeeded);
      if (playerCount !== newPlayerCount) {
        setPlayerCount(newPlayerCount);
      }
    }

    // Skill level
    if (params.skillLevel && typeof params.skillLevel === 'string') {
      const newSkillLevel = Number(params.skillLevel);
      if (skillLevel !== newSkillLevel) {
        setSkillLevel(newSkillLevel);
      }
    }

    // Handle date/time parsing - only update if not already set
    if (params.playTime && !startTime) {
      try {
        let startDate: Date | null = null;

        if (typeof params.playTime === 'string') {
          if (params.playTime.includes(',')) {
            const timeArray = params.playTime
              .split(',')
              .map((v) => Number(v.trim()));
            console.log('Parsed playTime array:', timeArray);

            if (timeArray.length >= 3) {
              startDate = new Date(
                timeArray[0],
                timeArray[1] - 1,
                timeArray[2],
                timeArray[3] || 0,
                timeArray[4] || 0,
                timeArray[5] || 0
              );
            }
          } else {
            startDate = new Date(params.playTime);
          }
        }

        if (startDate && !isNaN(startDate.getTime())) {
          console.log('Setting start date:', startDate);
          setSelectedDate(startDate);
          setStartTime(startDate);
        }
      } catch (error) {
        console.error('Error parsing playTime:', error);
      }
    }

    if (params.playEndTime && !endTime) {
      try {
        let endDate: Date | null = null;

        if (typeof params.playEndTime === 'string') {
          if (params.playEndTime.includes(',')) {
            const timeArray = params.playEndTime
              .split(',')
              .map((v) => Number(v.trim()));
            console.log('Parsed playEndTime array:', timeArray);

            if (timeArray.length >= 3) {
              endDate = new Date(
                timeArray[0],
                timeArray[1] - 1,
                timeArray[2],
                timeArray[3] || 0,
                timeArray[4] || 0,
                timeArray[5] || 0
              );
            }
          } else {
            endDate = new Date(params.playEndTime);
          }
        }

        if (endDate && !isNaN(endDate.getTime())) {
          console.log('Setting end date:', endDate);
          setEndTime(endDate);
        }
      } catch (error) {
        console.error('Error parsing playEndTime:', error);
      }
    }
  }, [isEditMode, params?.finderId]); // Changed dependencies

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
      params: { source: 'find-player' },
    });
  };

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

  const toLocalISOString = (date: Date): string => {
    const pad = (n: number, digits = 2) => String(n).padStart(digits, '0');

    return (
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
      )}` +
      `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
        date.getSeconds()
      )}` +
      `.${pad(date.getMilliseconds(), 3)}Z`
    );
  };

  const handleEventNameClick = () => {
    // Placeholder function for event name click
    // You can implement functionality here when needed
  };

  const handleSubmit = async () => {
    // Determine the place to play - either from AddPlace or from preferred places
    const finalPlaceToPlay = placeToSave ? placeToSave.Name : placeToPlay;

    if (!finalPlaceToPlay) {
      Alert.alert('Missing Information', 'Please select a place to play.');
      return;
    }

    if (!selectedDate || !startTime) {
      Alert.alert('Missing Information', 'Please select date and start time.');
      return;
    }

    const playTime = new Date(selectedDate);
    playTime.setHours(startTime.getHours());
    playTime.setMinutes(startTime.getMinutes());
    playTime.setSeconds(0);

    let finalEndTime: Date;
    if (endTime) {
      finalEndTime = new Date(selectedDate);
      finalEndTime.setHours(endTime.getHours());
      finalEndTime.setMinutes(endTime.getMinutes());
      finalEndTime.setSeconds(0);
    } else {
      finalEndTime = new Date(playTime.getTime() + 2 * 60 * 60 * 1000);
    }

    if (isEditMode && finderId) {
      // ----- EDIT MODE (PUT)
      const updatePayload = {
        placeToPlay: finalPlaceToPlay,
        playTime: toLocalISOString(playTime),
        playEndTime: toLocalISOString(finalEndTime),
        playersNeeded: playerCount,
        skillLevel: String(skillLevel),
      };

      console.log('Update Payload:', updatePayload);

      const success = await updateEvent(finderId, userId!, updatePayload);

      if (success) {
        Alert.alert(
          'Success!',
          'Your player finder request has been updated.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/(authenticated)/home');
              },
            },
          ]
        );
      } else {
        setConflictDialogVisible(true);
      }
    } else {
      // ----- CREATE MODE (POST)
      const requestData = {
        finderData: {
          eventName,
          requestorId: userId,
          placeToPlay: finalPlaceToPlay,
          playTime: toLocalISOString(playTime),
          playEndTime: toLocalISOString(finalEndTime),
          playersNeeded: playerCount,
          skillRating: skillLevel,
          preferredContacts,
        },
        ...(placeToSave && { placeToSave }),
      };

      console.log('Create Payload:', requestData);

      requestPlayerFinder({
        finderData: requestData.finderData,
        placeToSave: requestData.placeToSave,
        callbacks: {
          onSuccess: () => {
            resetForm();
            dispatch(triggerInvitationsRefetch());
            setSubmitted(true);

            Alert.alert(
              'Success!',
              'Your player finder request has been submitted.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    setSelectedDate(null);
                    setStartTime(null);
                    setEndTime(null);
                    setSkillLevel(user?.playerDetails?.personalRating ?? 3);
                    setPlayerCount(1);
                    setSubmitted(false);
                    setPlaceToSave(null);
                    dispatch(setPlaceToPlay(''));
                    setTimeout(() => {
                      router.replace('/(authenticated)/home');
                    }, 100);
                  },
                },
              ]
            );
          },
          onError: () => {
            setConflictDialogVisible(true);
          },
        },
      });
    }
  };

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

  return (
    <View style={styles.container}>
      {/* Main Header */}
      <View style={styles.mainHeader}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              resetForm();
              router.back();
            }}
            style={styles.backButton}
          >
            <Ionicons name='arrow-back' size={24} color='#cce5e3' />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.MainTitle}>
              {isEditMode ? 'Edit Player Finder' : 'Find Player'}
            </Text>
            <Text style={styles.subtitle}>
              {isEditMode
                ? 'Update your player finder details'
                : 'Fill out details to find a player'}
            </Text>
          </View>
          <UserAvatar size={30} />
        </View>
      </View>

      <ScrollView style={styles.formScrollView}>
        {isEditMode !== true && (
          <>
            {/* Event Name */}
            <Text style={styles.sectionTitle}>Event Name</Text>
            <EventNameSearch
              value={eventName}
              onChange={setEventName}
              requesterId={userId}
              onSelect={(event) => {
                setEventName(event.eventName);
                setSkillLevel(event.skillRating);
                setPlayerCount(event.playersNeeded);
                dispatch(setPlaceToPlay(event.placeToPlay));
                if (event.preferredContacts?.length > 0) {
                  dispatch(setPreferredContacts(event.preferredContacts));
                }
              }}
              error={false}
            />
          </>
        )}

        {/* Club Name Section */}
        <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Place</Text>
        <View style={styles.dropdownRow}>
          <Button
            mode='outlined'
            onPress={handleClubDetailsClick}
            style={styles.dropdownButton}
            contentStyle={styles.dropdownContent}
            textColor='#2C7E88'
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText} numberOfLines={1}>
                {placeToPlay || 'Enter Place Name'}
              </Text>
              <View style={styles.iconContainer}>
                <Icon source='chevron-down' size={20} />
              </View>
            </View>
          </Button>

          <IconButton
            icon='plus'
            size={24}
            iconColor='white'
            onPress={handleAddPlace}
            style={styles.disabledPlus}
          />

          <PreferredPlacesModal
            visible={preferredPlaceModal}
            handleClose={() => {
              dispatch(closePreferredPlaceModal());
            }}
            locationPermissionGranted={locationPermissionGranted}
          />
        </View>

        {/* Location permission hint */}
        {locationPermissionGranted === false && (
          <Text style={styles.permissionHint}>
            Enable location access to search nearby courts
          </Text>
        )}

        {/* Game Schedule Section - Using the new component */}
        <GameSchedulePicker
          selectedDate={selectedDate}
          startTime={startTime}
          endTime={endTime}
          onDateChange={setSelectedDate}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
        />

        <View style={styles.formSection}>
          <View style={styles.sliderSection}>
            <Text style={styles.sectionTitle}>Minimum Skill Level</Text>
            <View onLayout={handleLayout} style={styles.sliderWrapper}>
              {/* Floating Label */}
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
                minimumTrackTintColor='#2C7E88'
                maximumTrackTintColor='#E5E7EB'
                thumbTintColor='#2C7E88'
                onValueChange={handleValueChange}
              />
            </View>
          </View>
        </View>
        <View style={styles.formSection}>
          <PlayerCountDropdown
            playerCount={playerCount}
            onPlayerCountChange={setPlayerCount}
          />
        </View>

        {isEditMode !== true && (
          <>
            {/* Preferred Players */}
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
          </>
        )}

        {/* Action Button */}
        <View style={styles.actionButtonContainer}>
          <Button
            mode='contained'
            style={styles.findPlayerButton}
            onPress={handleSubmit}
            icon={'magnify'}
            loading={finderStatus === 'loading' || editStatus === 'loading'}
            disabled={
              finderStatus === 'loading' ||
              editStatus === 'loading' ||
              submitted
            }
            buttonColor='#2C7E88'
          >
            {submitted
              ? 'Submitted'
              : isEditMode === true
              ? 'Update Request'
              : 'Find Player'}
          </Button>
        </View>
      </ScrollView>

      {/* Booking conflict dialog */}
      <Portal>
        <Dialog
          visible={conflictDialogVisible}
          onDismiss={() => setConflictDialogVisible(false)}
        >
          <Dialog.Title>Booking Conflict</Dialog.Title>
          <Dialog.Content>
            <Text variant='bodyMedium'>
              You already have a booking at this time. Please choose another
              slot.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setConflictDialogVisible(false)}
              textColor='#2C7E88'
            >
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

export default FindPlayerLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainHeader: {
    backgroundColor: '#2C7E88',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
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
  MainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    color: '#fff',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    marginTop: 4,
  },

  backButton: {
    marginRight: 8,
    marginLeft: -8,
  },

  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dropdownButton: {
    flex: 1,
    height: 48,
    marginRight: 8,
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
  },
  dropdownContent: {
    height: '100%',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },

  buttonText: {
    flexShrink: 1,
    fontSize: 15,
    marginLeft: -10,
  },

  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: -12,
    gap: 4,
  },
  permissionHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: -16,
    marginBottom: 16,
    marginLeft: 4,
  },
  disabledPlus: {
    backgroundColor: '#2C7E88',
    marginTop: 0,
    borderRadius: 8,
    opacity: 1,
  },
  formScrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  formSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 8,
  },

  sliderSection: {
    paddingHorizontal: 0,
    marginBottom: -48,
  },

  sliderWrapper: {
    position: 'relative',
    height: 60,
    justifyContent: 'center',
    marginLeft: -8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  floatingLabel: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#2C7E88',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  floatingText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  selectedValue: {
    marginTop: 8,
    fontSize: 14,
    color: '#2C7E88',
    fontWeight: '500',
  },
  selectedSkillLevel: {
    marginTop: 8,
    fontSize: 14,
    color: '#2C7E88',
    fontWeight: '500',
  },
  playerCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  playerCount: {
    marginHorizontal: 16,
    minWidth: 40,
    textAlign: 'center',
    color: '#2C7E88',
  },
  contactsButton: {
    justifyContent: 'flex-start',
    borderColor: '#2C7E88',
  },
  selectedPlayersContainer: {
    marginBottom: 16,
  },
  countSelector: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-around',
  },
  countButton: {
    marginHorizontal: 4,
    borderColor: '#2C7E88',
  },
  actionButtonContainer: {
    marginTop: 24,
    marginBottom: 20,
  },
  findPlayerButton: {
    paddingVertical: 8,
    borderRadius: 8,
  },
});
