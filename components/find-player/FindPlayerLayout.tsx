import { AppDispatch, RootState } from '@/store';
import { loadContacts } from '@/store/playerFinderSlice';
import {
  closePreferredPlaceModal,
  openPreferredPlaceModal,
} from '@/store/uiSlice';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Icon, IconButton, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import PreferredPlacesModal from '../find-players/preferred-places-modal/PreferredPlacesModal';
import GameSchedulePicker from '../game-scheduler-picker/GameSchedulePicker';
import PlayerCountDropdown from '../player-count/PlayerCountDropdown';
const getSliderColor = (value: number): string => {
  if (value <= 2) return '#f4d03f';
  if (value <= 3) return '#90ee90';
  if (value <= 4) return '#f39c12';
  return '#e74c3c';
};
const FindPlayerLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // State management
  const [clubName, setClubName] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [skillLevel, setSkillLevel] = useState(3);
  const [playerCount, setPlayerCount] = useState(1);
  const [preferredPlayers, setPreferredPlayers] = useState<string[]>([]);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<
    boolean | null
  >(null);

  const { preferredPlaceModal } = useSelector((state: RootState) => state.ui);
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
        <View style={styles.formSection}>
          <Text variant='titleMedium' style={styles.sectionTitle}>
            Preferred Players
          </Text>

          {/* Choose Preferred Players */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Select Preferred Players</Text>
            <Button
              mode='outlined'
              icon='account-multiple'
              style={styles.contactsButton}
              onPress={() => {
                console.log('Open contact selector');
              }}
            >
              Choose from contacts
            </Button>
          </View>

          {/* Selected Preferred Players */}
          {preferredPlayers.length > 0 && (
            <View style={styles.selectedPlayersContainer}>
              <Text style={styles.inputLabel}>
                Selected Players ({preferredPlayers.length})
              </Text>
              <View style={styles.chipsContainer}>
                {preferredPlayers.map((player, index) => (
                  <Chip
                    key={index}
                    onClose={() => {
                      setPreferredPlayers(
                        preferredPlayers.filter((_, i) => i !== index)
                      );
                    }}
                    style={styles.playerChip}
                  >
                    {player}
                  </Chip>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.actionButtonContainer}>
          <Button
            mode='contained'
            style={styles.findPlayerButton}
            onPress={() => {
              console.log('Finding players...');
              console.log({
                place: placeToPlay,
                date: selectedDate,
                startTime,
                endTime,
                skillLevel,
                playerCount,
                preferredPlayers,
              });
            }}
            icon='magnify'
          >
            Find Player
          </Button>
        </View>
      </ScrollView>
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
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  playerChip: {
    marginBottom: 4,
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
