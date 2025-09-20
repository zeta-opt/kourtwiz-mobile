import UserAvatar from '@/assets/UserAvatar';
import { RootState } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { Button, Switch, Text, TextInput } from 'react-native-paper';
import { useSelector } from 'react-redux';

const AddPlace = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId;

  // Get the source route from params
  const source = params.source as string;

  // State management
  const [placeName, setPlaceName] = useState('');
  const [location, setLocation] = useState('');
  const [courtType, setCourtType] = useState('');
  const [netType, setNetType] = useState<'permanent' | 'temporary'>(
    'permanent'
  );
  const [numberOfCourts, setNumberOfCourts] = useState('1');
  const [isPrivate, setIsPrivate] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [membershipRequired, setMembershipRequired] = useState<
    'yes' | 'no' | 'required'
  >('no');
  const [isFree, setIsFree] = useState(false);
  const [lightsAvailable, setLightsAvailable] = useState(false);
  const [restroom, setRestroom] = useState(false);
  const [parking, setParking] = useState(false);
  const [isStartTimePickerVisible, setIsStartTimePickerVisible] =
    useState(false);
  const [isEndTimePickerVisible, setIsEndTimePickerVisible] = useState(false);
  const [showCourtDropdown, setShowCourtDropdown] = useState(false);

  const courtNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const showStartTimePicker = () => setIsStartTimePickerVisible(true);
  const hideStartTimePicker = () => setIsStartTimePickerVisible(false);
  const showEndTimePicker = () => setIsEndTimePickerVisible(true);
  const hideEndTimePicker = () => setIsEndTimePickerVisible(false);

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
        creatorId: userId,
        isPrivate: isPrivate,
      },
    };

    console.log('Add Place Data:', placeData);

    // Show success message
    Alert.alert('Success!', 'Place has been added successfully.', [
      {
        text: 'OK',
        onPress: () => {
          // Route back based on source
          if (source === 'find-player') {
            router.replace({
              pathname: '/(authenticated)/find-player',
              params: {
                newPlace: JSON.stringify(placeData.allCourts),
                placeName: placeData.allCourts.Name,
              },
            });
          } else if (source === 'create-event') {
            router.replace({
              pathname: '/(authenticated)/create-event',
              params: {
                newPlace: JSON.stringify(placeData.allCourts),
                placeName: placeData.allCourts.Name,
              },
            });
          } else {
            // Default fallback - go back
            router.back();
          }
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
            <Text style={styles.subtitle}>Fill out form to add place</Text>
          </View>
          <UserAvatar size={30} />
        </View>
      </View>

      <ScrollView style={styles.formScrollView}>
        {/* Place Name */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Name</Text>
          <TextInput
            mode='outlined'
            value={placeName}
            onChangeText={setPlaceName}
            placeholder='Enter name'
            outlineColor='#000'
            activeOutlineColor='#2C7E88'
            style={styles.textInput}
            contentStyle={{ height: 40, fontSize: 16 }}
            theme={{ roundness: 8 }}
          />
        </View>

        {/* Location */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TextInput
            mode='outlined'
            value={location}
            onChangeText={setLocation}
            placeholder='Enter Full Address'
            style={styles.textInput}
            outlineColor='#000'
            activeOutlineColor='#2C7E88'
            contentStyle={{ height: 40, fontSize: 16 }}
            theme={{ roundness: 8 }}
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
            outlineColor='#000'
            activeOutlineColor='#2C7E88'
            contentStyle={{ height: 40, fontSize: 16 }}
            theme={{ roundness: 8 }}
          />
        </View>

        {/* Net Type */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Net Type</Text>
          <View style={styles.netTypeContainer}>
            <TouchableOpacity
              style={[
                styles.netTypeButton,
                netType === 'permanent' && styles.netTypeButtonActive,
              ]}
              onPress={() => setNetType('permanent')}
            >
              <Text
                style={[
                  styles.netTypeText,
                  netType === 'permanent' && styles.netTypeTextActive,
                ]}
              >
                Permanent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.netTypeButton,
                netType === 'temporary' && styles.netTypeButtonActive,
              ]}
              onPress={() => setNetType('temporary')}
            >
              <Text
                style={[
                  styles.netTypeText,
                  netType === 'temporary' && styles.netTypeTextActive,
                ]}
              >
                Temporary
              </Text>
            </TouchableOpacity>
          </View>
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
              onPress={showStartTimePicker}
            >
              <Text style={styles.timeLabel}>Start Time</Text>
              <Text style={styles.timeText}>{formatTime(startTime)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timeButton}
              onPress={showEndTimePicker}
            >
              <Text style={styles.timeLabel}>End Time</Text>
              <Text style={styles.timeText}>{formatTime(endTime)}</Text>
            </TouchableOpacity>
          </View>

          {/* Start Time Picker Modal */}
          <DatePicker
            modal
            mode='time'
            open={isStartTimePickerVisible}
            date={startTime}
            onConfirm={(date) => {
              setStartTime(date);
              if (!endTime || endTime <= date) {
                const newEndTime = new Date(date);
                newEndTime.setHours(date.getHours() + 1);
                setEndTime(newEndTime);
              }
              hideStartTimePicker();
            }}
            onCancel={hideStartTimePicker}
          />

          {/* End Time Picker Modal */}
          <DatePicker
            modal
            mode='time'
            open={isEndTimePickerVisible}
            date={endTime}
            onConfirm={(date) => {
              setEndTime(date);
              hideEndTimePicker();
            }}
            onCancel={hideEndTimePicker}
          />
        </View>

        {/* Membership Required */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Membership Required</Text>
          <View style={styles.membershipContainer}>
            <TouchableOpacity
              style={[
                styles.membershipButton,
                membershipRequired === 'yes' && styles.membershipButtonActive,
              ]}
              onPress={() => {
                console.log('Setting membership to yes');
                setMembershipRequired('yes');
              }}
            >
              <View
                style={[
                  styles.radioCircle,
                  membershipRequired === 'yes' && styles.radioCircleActive,
                ]}
              >
                {membershipRequired === 'yes' && (
                  <View style={styles.radioCircleFilledActive} />
                )}
              </View>
              <Text
                style={[
                  styles.membershipText,
                  membershipRequired === 'yes' && styles.membershipTextActive,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.membershipButton,
                membershipRequired === 'no' && styles.membershipButtonActive,
              ]}
              onPress={() => setMembershipRequired('no')}
            >
              <View
                style={[
                  styles.radioCircle,
                  membershipRequired === 'no' && styles.radioCircleActive,
                ]}
              >
                {membershipRequired === 'no' && (
                  <View style={styles.radioCircleFilledActive} />
                )}
              </View>
              <Text
                style={[
                  styles.membershipText,
                  membershipRequired === 'no' && styles.membershipTextActive,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.membershipButton,
                membershipRequired === 'required' &&
                  styles.membershipButtonActive,
              ]}
              onPress={() => setMembershipRequired('required')}
            >
              <View
                style={[
                  styles.radioCircle,
                  membershipRequired === 'required' && styles.radioCircleActive,
                ]}
              >
                {membershipRequired === 'required' && (
                  <View style={styles.radioCircleFilledActive} />
                )}
              </View>
              <Text
                style={[
                  styles.membershipText,
                  membershipRequired === 'required' &&
                    styles.membershipTextActive,
                ]}
              >
                Required
              </Text>
            </TouchableOpacity>
          </View>
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

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Is Private</Text>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
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
    fontSize: 20,
    fontWeight: '600',
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
    borderRadius: 16, // optional
  },

  inputContent: {
    height: 30, // smaller inner height
    fontSize: 16, // smaller text
    paddingVertical: 0,
  },
  segmentedButtons: {
    marginTop: 8,
  },
  netTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  netTypeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  netTypeButtonActive: {
    backgroundColor: '#2C7E88',
    borderColor: '#2C7E88',
  },
  netTypeText: {
    fontSize: 16,
    color: '#000',
  },
  netTypeTextActive: {
    color: '#fff',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
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
    borderColor: '#000',
    borderRadius: 8,
    padding: 8,
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
  membershipContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  membershipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  membershipButtonActive: {
    // Optional: add background color or other styling for active state
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioCircleActive: {
    borderColor: '#2C7E88',
  },
  radioCircleFilled: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
  },
  radioCircleFilledActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2C7E88',
  },
  membershipText: {
    fontSize: 16,
    color: '#000',
  },
  membershipTextActive: {
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
    paddingVertical: 4,
    borderRadius: 16,
  },
});
