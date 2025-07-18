import { useRequestPlayerFinder } from '@/hooks/apis/player-finder/useRequestPlayerFinder';
import { AppDispatch, RootState } from '@/store';
import {
  Contact,
  loadContacts,
  resetPlayerFinderData,
  setPreferredContacts,
} from '@/store/playerFinderSlice';
import {
  closePreferredPlaceModal,
  closePreferredPlayersModal,
  openPreferredPlaceModal,
  openPreferredPlayersModal,
} from '@/store/uiSlice';
import Slider from '@react-native-community/slider';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
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
import PreferredPlacesModal from './preferred-places-modal/PreferredPlacesModal';

const getSliderColor = (value: number): string => {
  if (value <= 2) return '#f4d03f';
  if (value <= 3) return '#90ee90';
  if (value <= 4) return '#f39c12';
  return '#e74c3c';
};

const FindPlayerLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Get user from Redux
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId;

  // State management
  const [clubName, setClubName] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [skillLevel, setSkillLevel] = useState(
    user?.playerDetails?.personalRating ?? 3
  );
  const [playerCount, setPlayerCount] = useState(1);
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const [conflictDialogVisible, setConflictDialogVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Add the hook for player finder
  const { requestPlayerFinder, status: finderStatus } =
    useRequestPlayerFinder();

  const preferredContacts = useSelector(
    (state: RootState) => state.playerFinder.preferredContacts
  );
  console.log(preferredContacts);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<
    boolean | null
  >(null);

  const { preferredPlaceModal } = useSelector((state: RootState) => state.ui);
  const { preferredPlayersModal } = useSelector((state: RootState) => state.ui);

  const { placeToPlay } = useSelector((state: RootState) => state.playerFinder);

  // Check location permission status on mount
  useEffect(() => {
    checkLocationPermission();
  }, []);

  useEffect(() => {
    dispatch(loadContacts());
  }, [dispatch]);

  const checkLocationPermission = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setLocationPermissionGranted(status === 'granted');
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
        // Open modal after permission granted
        dispatch(openPreferredPlaceModal());

        // Show info about nearby places
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
    // Directly replace the preferred contacts with the selection from modal
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

  // Add the handleSubmit function
  const handleSubmit = async () => {
    // Validate required fields
    if (!placeToPlay) {
      Alert.alert('Missing Information', 'Please select a place to play.');
      return;
    }

    if (!selectedDate || !startTime) {
      Alert.alert('Missing Information', 'Please select date and start time.');
      return;
    }

    // Create play time from selected date and start time
    const playTime = new Date(selectedDate);
    playTime.setHours(startTime.getHours());
    playTime.setMinutes(startTime.getMinutes());
    playTime.setSeconds(0);

    // Calculate end time - use provided end time or default to 2 hours after start
    let finalEndTime: Date;
    if (endTime) {
      finalEndTime = new Date(selectedDate);
      finalEndTime.setHours(endTime.getHours());
      finalEndTime.setMinutes(endTime.getMinutes());
      finalEndTime.setSeconds(0);
    } else {
      finalEndTime = new Date(playTime.getTime() + 2 * 60 * 60 * 1000);
    }

    console.log({
      requestorId: userId,
      placeToPlay,
      playTime: toLocalISOString(playTime),
      playEndTime: toLocalISOString(finalEndTime),
      playersNeeded: playerCount,
      skillRating: skillLevel,
      preferredContacts,
    });
    requestPlayerFinder({
      finderData: {
        requestorId: userId,
        placeToPlay,
        playTime: toLocalISOString(playTime),
        playEndTime: toLocalISOString(finalEndTime),
        playersNeeded: playerCount,
        skillRating: skillLevel,
        preferredContacts,
      },
      callbacks: {
        onSuccess: () => {
          dispatch(resetPlayerFinderData());
          setSubmitted(true);

          // Show success message
          Alert.alert(
            'Success!',
            'Your player finder request has been submitted.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Reset form
                  setSelectedDate(null);
                  setStartTime(null);
                  setEndTime(null);
                  setSkillLevel(user?.playerDetails?.personalRating ?? 3);
                  setPlayerCount(1);
                  setSubmitted(false);

                  // Navigate back or to another screen
                  router.back();
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
  };

  const sliderColor = getSliderColor(skillLevel);

  return (
    <View style={styles.container}>
      {/* Main Header */}
      <View style={styles.mainHeader}>
        <View style={styles.headerContent}>
          <IconButton
            icon='arrow-left'
            size={24}
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <Text variant='headlineLarge'>Find Player</Text>
        </View>
      </View>

      <ScrollView style={styles.formScrollView}>
        {/* Club Details Section */}
        <Text variant='titleMedium' style={styles.sectionTitle}>
          Club Details
        </Text>
        <View style={styles.dropdownRow}>
          <Button
            mode='outlined'
            onPress={handleClubDetailsClick}
            style={styles.dropdownButton}
            contentStyle={styles.dropdownContent}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>
                {placeToPlay || 'Enter Place Name'}
              </Text>
              <View style={styles.iconContainer}>
                {locationPermissionGranted && (
                  <Icon source='map-marker' size={16} color='#2C7E88' />
                )}
                <Icon source='chevron-down' size={20} />
              </View>
            </View>
          </Button>
          <IconButton
            icon='plus'
            size={24}
            iconColor='white'
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
          <View style={styles.container}>
            <Text variant='titleMedium'>Skill Level</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={5}
              step={0.1}
              value={skillLevel ?? 1}
              minimumTrackTintColor={sliderColor}
              maximumTrackTintColor='#ccc'
              thumbTintColor={sliderColor}
              onValueChange={(value) => setSkillLevel(value)}
            />
            <Text>Selected: {skillLevel.toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.formSection}>
          <PlayerCountDropdown
            playerCount={playerCount}
            onPlayerCountChange={setPlayerCount}
          />
        </View>

        {/* Preferred Players Section */}
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

        <View style={styles.actionButtonContainer}>
          <Button
            mode='contained'
            style={styles.findPlayerButton}
            onPress={handleSubmit}
            icon='magnify'
            loading={finderStatus === 'loading'}
            disabled={finderStatus === 'loading' || submitted}
          >
            {submitted ? 'Submitted' : 'Find Player'}
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
            <Button onPress={() => setConflictDialogVisible(false)}>OK</Button>
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
    padding: 16,
    backgroundColor: '#fff',
  },
  mainHeader: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
    marginLeft: -8,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownButton: {
    flex: 1,
    height: 48,
    borderColor: '#ccc',
    marginTop: 8,
    marginRight: 8,
    justifyContent: 'center',
    borderRadius: 8,
  },
  dropdownContent: {
    height: '100%',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonText: {
    flex: 1,
    textAlign: 'left',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  permissionHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 4,
  },
  disabledPlus: {
    backgroundColor: '#2C7E88',
    marginTop: 8,
    borderRadius: 8,
    opacity: 1,
  },
  formScrollView: {
    flex: 1,
  },
  formSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    marginBottom: 4,
    fontWeight: 'condensed',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  textInput: {
    backgroundColor: '#fff',
  },
  sliderContainer: {
    marginTop: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  skillLevelLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: -5,
  },
  skillLabel: {
    fontSize: 11,
    color: '#888',
  },
  activeSkillLabel: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  selectedSkillLevel: {
    marginTop: 8,
    fontSize: 14,
    color: '#1976d2',
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
  },
  contactsButton: {
    justifyContent: 'flex-start',
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
  },
  actionButtonContainer: {
    marginTop: 24,
    marginBottom: 20,
  },
  findPlayerButton: {
    paddingVertical: 8,
  },
});
