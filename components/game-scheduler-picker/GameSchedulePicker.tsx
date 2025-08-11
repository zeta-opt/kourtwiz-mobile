import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Button, Icon, Text } from 'react-native-paper';

interface GameSchedulePickerProps {
  selectedDate: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  onDateChange: (date: Date) => void;
  onStartTimeChange: (time: Date) => void;
  onEndTimeChange: (time: Date) => void;
  errors?: { 
    selectedDate?: boolean;
    startTime?: boolean;
    endTime?: boolean;
  };
}

const GameSchedulePicker: React.FC<GameSchedulePickerProps> = ({
  selectedDate,
  startTime,
  endTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  errors = {}
}) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisibility] =
    useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleDateConfirm = (date: Date) => {
    onDateChange(date);
    hideDatePicker();
  };

  const showStartTimePicker = () => setStartTimePickerVisibility(true);
  const hideStartTimePicker = () => setStartTimePickerVisibility(false);
  const handleStartTimeConfirm = (time: Date) => {
    onStartTimeChange(time);

    // Automatically update end time to be 1 hour later if no end time is set
    if (!endTime) {
      const newEndTime = new Date(time);
      newEndTime.setHours(time.getHours() + 1);
      onEndTimeChange(newEndTime);
    }

    hideStartTimePicker();
  };

  const showEndTimePicker = () => setEndTimePickerVisibility(true);
  const hideEndTimePicker = () => setEndTimePickerVisibility(false);
  const handleEndTimeConfirm = (time: Date) => {
    onEndTimeChange(time);
    hideEndTimePicker();
  };

  // Format time for display
  const formatTime = (date: Date | null) => {
    if (!date) return null;
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get default date for time picker
  const getDefaultTimePickerDate = () => {
    const now = new Date();
    // Round to nearest 15 minutes for better UX
    const minutes = Math.ceil(now.getMinutes() / 15) * 15;
    now.setMinutes(minutes, 0, 0);
    return now;
  };

  return (
    <>
      <View style={styles.formSection}>
        {/* Date Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date *</Text>
          <Button
            mode='outlined'
            style={[
              styles.dateTimeButton,
              styles.roundedButton,
              styles.whiteButton,
              styles.blackBorder,
              errors.selectedDate && { borderColor: 'red', borderWidth: 1 }
            ]}
            onPress={showDatePicker}
            contentStyle={styles.fullWidth}
          >
            <View style={styles.buttonContent}>
              <Text
                style={[
                  styles.timeText,
                  { color: selectedDate ? '#000' : '#9F9F9F' },
                ]}
              >
                {selectedDate
                  ? selectedDate.toLocaleDateString('en-GB')
                  : 'DD/MM/YYYY'}
              </Text>
              <Icon
                source='calendar'
                size={20}
                color={selectedDate ? '#000' : '#9F9F9F'}
              />
            </View>
          </Button>
        </View>

        {/* Time Row */}
        <View style={styles.timeRow}>
          {/* Start Time */}
          <View style={[styles.inputGroup, styles.timeInput]}>
            <Text style={styles.inputLabel}>Start Time *</Text>
            <Button
              mode='outlined'
              style={[
                styles.dateTimeButton,
                styles.roundedButton,
                styles.whiteButton,
                styles.blackBorder,
                errors.startTime && { borderColor: 'red', borderWidth: 1 }
              ]}
              contentStyle={styles.fullWidth}
              onPress={showStartTimePicker}
            >
              <View style={styles.buttonContent}>
                <Text
                  style={[
                    styles.timeText,
                    { color: startTime ? '#000' : '#9F9F9F' },
                  ]}
                >
                  {formatTime(startTime) || 'Start Time'}
                </Text>
                <Icon
                  source='chevron-down'
                  size={20}
                  color={startTime ? '#000' : '#9F9F9F'}
                />
              </View>
            </Button>
          </View>

          {/* End Time */}
          <View style={[styles.inputGroup, styles.timeInput]}>
            <Text style={styles.inputLabel}>End Time *</Text>
            <Button
              mode='outlined'
              style={[
                styles.dateTimeButton,
                styles.roundedButton,
                styles.whiteButton,
                styles.blackBorder,
                errors.endTime && { borderColor: 'red', borderWidth: 1 }
              ]}
              contentStyle={styles.fullWidth}
              onPress={showEndTimePicker}
            >
              <View style={styles.buttonContent}>
                <Text
                  style={[
                    styles.timeText,
                    { color: endTime ? '#000' : '#9F9F9F' },
                  ]}
                >
                  {formatTime(endTime) || 'End Time'}
                </Text>
                <Icon
                  source='chevron-down'
                  size={20}
                  color={endTime ? '#000' : '#9F9F9F'}
                />
              </View>
            </Button>
          </View>
        </View>
      </View>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode='date'
        date={selectedDate || new Date()}
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
        display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
        minimumDate={new Date()}
      />

      {/* Start Time Picker */}
      <DateTimePickerModal
        isVisible={isStartTimePickerVisible}
        mode='time'
        date={startTime || getDefaultTimePickerDate()}
        onConfirm={handleStartTimeConfirm}
        onCancel={hideStartTimePicker}
        display='spinner'
        is24Hour={false}
        minuteInterval={15}
      />

      {/* End Time Picker */}
      <DateTimePickerModal
        isVisible={isEndTimePickerVisible}
        mode='time'
        date={
          endTime ||
          (startTime
            ? new Date(startTime.getTime() + 60 * 60 * 1000)
            : getDefaultTimePickerDate())
        }
        onConfirm={handleEndTimeConfirm}
        onCancel={hideEndTimePicker}
        display='spinner'
        is24Hour={false}
        minuteInterval={15}
        minimumDate={startTime || undefined}
      />
    </>
  );
};

export default GameSchedulePicker;

const styles = StyleSheet.create({
  formSection: {
    marginBottom: 24,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  fullWidth: {
    width: '100%',
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
  timeText: {
    flex: 1,
    textAlign: 'left',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
});
