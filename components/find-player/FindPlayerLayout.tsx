import { useRequestPlayerFinder } from '@/hooks/apis/player-finder/useRequestPlayerFinder';
import { AppDispatch, RootState } from '@/store';
import {
  Contact,
  loadContacts,
  resetPlayerFinderData,
  setPreferredContacts,
} from '@/store/playerFinderSlice';
import { triggerInvitationsRefetch } from '@/store/refetchSlice';
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
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
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
import PreferredPlacesModal from './preferred-places-modal/PreferredPlacesModal';

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
          dispatch(triggerInvitationsRefetch()); // Add this line
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

                  setTimeout(() => {
                    router.back();
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
        <View style={styles.headerContent}>
          <IconButton
            icon='arrow-left'
            size={24}
            iconColor='white'
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <Text variant='headlineLarge' style={styles.headerTitle}>
            Find Player
          </Text>
        </View>
      </View>

      <ScrollView style={styles.formScrollView}>
        {/* Club Name Section */}
        <Text variant='titleMedium' style={styles.sectionTitle}>
          Club Name
        </Text>
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
            <Text variant='titleMedium' style={styles.skillLevelTitle}>
              Skill Level
            </Text>
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
                minimumTrackTintColor='#007AFF'
                maximumTrackTintColor='#E5E7EB'
                thumbTintColor='#007AFF'
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
            buttonColor='#2C7E88'
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
    marginTop: 8,
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
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  sliderSection: {
    paddingHorizontal: 16,
  },
  skillLevelTitle: {
    marginBottom: 8,
    fontWeight: '500',
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
    backgroundColor: '#007AFF',
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
