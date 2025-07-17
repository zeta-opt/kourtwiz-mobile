import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Button, Text } from 'react-native-paper';

interface GameSchedulePickerProps {
  selectedDate: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  onDateChange: (date: Date) => void;
  onStartTimeChange: (time: Date) => void;
  onEndTimeChange: (time: Date) => void;
}

const GameSchedulePicker: React.FC<GameSchedulePickerProps> = ({
  selectedDate,
  startTime,
  endTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
}) => {
  // Date/Time picker visibility states
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisibility] =
    useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

  // Date picker handlers
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleDateConfirm = (date: Date) => {
    onDateChange(date);
    hideDatePicker();
  };

  // Start time picker handlers
  const showStartTimePicker = () => setStartTimePickerVisibility(true);
  const hideStartTimePicker = () => setStartTimePickerVisibility(false);
  const handleStartTimeConfirm = (time: Date) => {
    // If there's a selected date, combine the date with the selected time
    if (selectedDate) {
      const newStartTime = new Date(selectedDate);
      newStartTime.setHours(time.getHours());
      newStartTime.setMinutes(time.getMinutes());
      newStartTime.setSeconds(0);
      onStartTimeChange(newStartTime);
    } else {
      onStartTimeChange(time);
    }
    hideStartTimePicker();
  };

  // End time picker handlers
  const showEndTimePicker = () => setEndTimePickerVisibility(true);
  const hideEndTimePicker = () => setEndTimePickerVisibility(false);
  const handleEndTimeConfirm = (time: Date) => {
    // If there's a selected date, combine the date with the selected time
    if (selectedDate) {
      const newEndTime = new Date(selectedDate);
      newEndTime.setHours(time.getHours());
      newEndTime.setMinutes(time.getMinutes());
      newEndTime.setSeconds(0);
      onEndTimeChange(newEndTime);
    } else {
      onEndTimeChange(time);
    }
    hideEndTimePicker();
  };

  return (
    <>
      <View style={styles.formSection}>
        {/* Date Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date *</Text>
          <Button
            mode='outlined'
            icon='calendar'
            style={styles.dateTimeButton}
            onPress={showDatePicker}
          >
            {selectedDate
              ? new Intl.DateTimeFormat('en-US', {
                  dateStyle: 'medium',
                }).format(selectedDate)
              : 'Select Date'}
          </Button>
        </View>

        {/* Time Row */}
        <View style={styles.timeRow}>
          {/* Start Time */}
          <View style={[styles.inputGroup, styles.timeInput]}>
            <Text style={styles.inputLabel}>Start Time *</Text>
            <Button
              mode='outlined'
              icon='clock-outline'
              style={styles.dateTimeButton}
              onPress={showStartTimePicker}
            >
              {startTime
                ? startTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Select Time'}
            </Button>
          </View>

          {/* End Time */}
          <View style={[styles.inputGroup, styles.timeInput]}>
            <Text style={styles.inputLabel}>End Time *</Text>
            <Button
              mode='outlined'
              icon='clock-outline'
              style={styles.dateTimeButton}
              onPress={showEndTimePicker}
            >
              {endTime
                ? endTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Select Time'}
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
        display='spinner'
      />

      {/* Start Time Picker Modal */}
      <DateTimePickerModal
        isVisible={isStartTimePickerVisible}
        mode='time'
        date={startTime || new Date()}
        onConfirm={handleStartTimeConfirm}
        onCancel={hideStartTimePicker}
        display='spinner'
      />

      {/* End Time Picker Modal */}
      <DateTimePickerModal
        isVisible={isEndTimePickerVisible}
        mode='time'
        date={
          endTime ||
          (startTime
            ? new Date(startTime.getTime() + 2 * 60 * 60 * 1000)
            : new Date())
        }
        onConfirm={handleEndTimeConfirm}
        onCancel={hideEndTimePicker}
        display='spinner'
      />
    </>
  );
};

export default GameSchedulePicker;

const styles = StyleSheet.create({
  formSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  dateTimeButton: {
    justifyContent: 'flex-start',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
});
