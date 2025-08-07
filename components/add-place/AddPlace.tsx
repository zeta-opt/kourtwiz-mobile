import UserAvatar from '@/assets/UserAvatar';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  RadioButton,
  SegmentedButtons,
  Switch,
  Text,
  TextInput,
} from 'react-native-paper';

const AddPlace = () => {
  const router = useRouter();

  // State management
  const [placeName, setPlaceName] = useState('');
  const [location, setLocation] = useState('');
  const [courtType, setCourtType] = useState('');
  const [netType, setNetType] = useState<'permanent' | 'temporary'>(
    'permanent'
  );
  const [numberOfCourts, setNumberOfCourts] = useState('1');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [membershipRequired, setMembershipRequired] = useState<
    'yes' | 'no' | 'required'
  >('no');
  const [isFree, setIsFree] = useState(false);
  const [lightsAvailable, setLightsAvailable] = useState(false);
  const [restroom, setRestroom] = useState(false);
  const [parking, setParking] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showCourtDropdown, setShowCourtDropdown] = useState(false);

  const courtNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartTime(selectedDate);
    }
  };

  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndTime(selectedDate);
    }
  };

  const handleSubmit = () => {
    if (!placeName.trim()) {
      Alert.alert('Missing Information', 'Please enter a place name.');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Missing Information', 'Please enter a location.');
      return;
    }

    // Convert number of courts to integer
    const courtsNumber =
      numberOfCourts === '10+' ? 10 : parseInt(numberOfCourts);

    // Convert membership value to match expected format
    const membershipValue =
      membershipRequired === 'required'
        ? 'Required'
        : membershipRequired === 'yes'
        ? 'Yes'
        : 'No';

    const placeData = {
      allCourts: {
        Name: placeName,
        Location: location,
        'Court Type': courtType || undefined,
        netType: netType,
        noOfCourts: courtsNumber,
        openingTime: `${String(startTime.getHours()).padStart(2, '0')}:${String(
          startTime.getMinutes()
        ).padStart(2, '0')}:00`,
        closingTime: `${String(endTime.getHours()).padStart(2, '0')}:${String(
          endTime.getMinutes()
        ).padStart(2, '0')}:00`,
        isFree: isFree,
        membership: membershipValue,
        Lighting: lightsAvailable ? 'Available' : 'Not Available',
        isRestRoomAvailable: restroom,
        isCarParkingAvailable: parking,
      },
    };

    console.log('Add Place Data:', placeData);

    // Show success message
    Alert.alert('Success!', 'Place has been added successfully.', [
      {
        text: 'OK',
        onPress: () => {
          // Pass the place data back to the create event form
          router.replace({
            pathname: '/(authenticated)/create-event',
            params: {
              newPlace: JSON.stringify(placeData.allCourts),
              placeName: placeData.allCourts.Name,
            },
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Main Header */}
      <View style={styles.mainHeader}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name='arrow-back' size={24} color='#cce5e3' />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.MainTitle}>Add Place</Text>
            <Text style={styles.subtitle}>Add a new place to play</Text>
          </View>
          <UserAvatar size={30} />
        </View>
      </View>

      <ScrollView style={styles.formScrollView}>
        {/* Place Name */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Enter Name</Text>
          <TextInput
            mode='outlined'
            value={placeName}
            onChangeText={setPlaceName}
            placeholder='Enter place name'
            style={styles.textInput}
            outlineColor='#2C7E88'
            activeOutlineColor='#2C7E88'
          />
        </View>

        {/* Location */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TextInput
            mode='outlined'
            value={location}
            onChangeText={setLocation}
            placeholder='Enter address or location'
            style={styles.textInput}
            outlineColor='#2C7E88'
            activeOutlineColor='#2C7E88'
          />
        </View>

        {/* Type of Court (Optional) */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Type of Court (Optional)</Text>
          <TextInput
            mode='outlined'
            value={courtType}
            onChangeText={setCourtType}
            placeholder='e.g., Indoor, Outdoor, Clay'
            style={styles.textInput}
            outlineColor='#2C7E88'
            activeOutlineColor='#2C7E88'
          />
        </View>

        {/* Net Type */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Net Type</Text>
          <SegmentedButtons
            value={netType}
            onValueChange={(value) =>
              setNetType(value as 'permanent' | 'temporary')
            }
            buttons={[
              {
                value: 'permanent',
                label: 'Permanent',
              },
              {
                value: 'temporary',
                label: 'Temporary',
              },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {/* Number of Courts */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Number of Courts</Text>
          <TouchableOpacity
            onPress={() => setShowCourtDropdown(!showCourtDropdown)}
            style={styles.dropdownButton}
          >
            <Text style={styles.dropdownText}>{numberOfCourts}</Text>
            <Ionicons name='chevron-down' size={20} color='#2C7E88' />
          </TouchableOpacity>
          {showCourtDropdown && (
            <View style={styles.dropdownList}>
              {courtNumbers.map((num) => (
                <TouchableOpacity
                  key={num}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setNumberOfCourts(num);
                    setShowCourtDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Hours of Operation */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Hours of Operation</Text>
          <View style={styles.timeRow}>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={styles.timeLabel}>Start Time</Text>
              <Text style={styles.timeText}>{formatTime(startTime)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={styles.timeLabel}>End Time</Text>
              <Text style={styles.timeText}>{formatTime(endTime)}</Text>
            </TouchableOpacity>
          </View>

          {showStartTimePicker && (
            <DateTimePicker
              value={startTime}
              mode='time'
              is24Hour={false}
              display='default'
              onChange={handleStartTimeChange}
            />
          )}

          {showEndTimePicker && (
            <DateTimePicker
              value={endTime}
              mode='time'
              is24Hour={false}
              display='default'
              onChange={handleEndTimeChange}
            />
          )}
        </View>

        {/* Membership Required */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Membership Required</Text>
          <RadioButton.Group
            onValueChange={(value) =>
              setMembershipRequired(value as 'yes' | 'no' | 'required')
            }
            value={membershipRequired}
          >
            <View style={styles.radioRow}>
              <View style={styles.radioItem}>
                <RadioButton value='yes' color='#2C7E88' />
                <Text>Yes</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value='no' color='#2C7E88' />
                <Text>No</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value='required' color='#2C7E88' />
                <Text>Required</Text>
              </View>
            </View>
          </RadioButton.Group>
        </View>

        {/* Toggle Switches */}
        <View style={styles.toggleSection}>
          {/* Is this place free */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Is this place free?</Text>
            <Switch value={isFree} onValueChange={setIsFree} color='#2C7E88' />
          </View>

          {/* Lights available */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Lights available</Text>
            <Switch
              value={lightsAvailable}
              onValueChange={setLightsAvailable}
              color='#2C7E88'
            />
          </View>

          {/* Rest room */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Rest room</Text>
            <Switch
              value={restroom}
              onValueChange={setRestroom}
              color='#2C7E88'
            />
          </View>

          {/* Parking available */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Parking available</Text>
            <Switch
              value={parking}
              onValueChange={setParking}
              color='#2C7E88'
            />
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.actionButtonContainer}>
          <Button
            mode='contained'
            style={styles.submitButton}
            onPress={handleSubmit}
            buttonColor='#2C7E88'
          >
            Add Place
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddPlace;

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
  formScrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
  },
  segmentedButtons: {
    marginTop: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C7E88',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
  },
  dropdownList: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2C7E88',
    borderRadius: 8,
    zIndex: 1000,
    elevation: 5,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  timeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2C7E88',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 16,
    color: '#2C7E88',
    fontWeight: '500',
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleSection: {
    marginBottom: 24,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  toggleLabel: {
    fontSize: 16,
    color: '#374151',
  },
  actionButtonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  submitButton: {
    paddingVertical: 8,
    borderRadius: 8,
  },
});
