import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
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
  errors = {},
}) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(
    false
  );
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

  // --- Date Picker Handlers ---
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleDateConfirm = (date: Date) => {
    onDateChange(date);

    // Sync start/end with chosen date
    if (startTime) {
      const newStart = new Date(date);
      newStart.setHours(startTime.getHours(), startTime.getMinutes());
      onStartTimeChange(newStart);
    }
    if (endTime) {
      const newEnd = new Date(date);
      newEnd.setHours(endTime.getHours(), endTime.getMinutes());
      onEndTimeChange(newEnd);
    }

    hideDatePicker();
  };

  // --- Time Picker Handlers ---
  const showStartTimePicker = () => setStartTimePickerVisibility(true);
  const hideStartTimePicker = () => setStartTimePickerVisibility(false);

  const showEndTimePicker = () => setEndTimePickerVisibility(true);
  const hideEndTimePicker = () => setEndTimePickerVisibility(false);

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
              errors.selectedDate && { borderColor: 'red', borderWidth: 1 },
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
                  ? selectedDate.toLocaleDateString('en-US')
                  : 'MM/DD/YYYY'}
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
                errors.startTime && { borderColor: 'red', borderWidth: 1 },
              ]}
              onPress={showStartTimePicker}
              contentStyle={styles.fullWidth}
            >
              <View style={styles.buttonContent}>
                <Text
                  style={[
                    styles.timeText,
                    { color: startTime ? '#000' : '#9F9F9F' },
                  ]}
                >
                  {startTime ? formatTime(startTime) : 'Start Time'}
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
                errors.endTime && { borderColor: 'red', borderWidth: 1 },
              ]}
              onPress={showEndTimePicker}
              contentStyle={styles.fullWidth}
            >
              <View style={styles.buttonContent}>
                <Text
                  style={[
                    styles.timeText,
                    { color: endTime ? '#000' : '#9F9F9F' },
                  ]}
                >
                  {endTime ? formatTime(endTime) : 'End Time'}
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
        maximumDate={new Date(2100, 11, 31)}
        minimumDate={new Date()}
      />
      {/* Start Time Picker Modal */}
      <DatePicker
        modal
        mode='time'
        open={isStartTimePickerVisible}
        date={startTime || new Date()}
        onConfirm={(date) => {
          onStartTimeChange(date);

          if (!endTime) {
            const newEndTime = new Date(date);
            newEndTime.setHours(date.getHours() + 1);
            onEndTimeChange(newEndTime);
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
        date={endTime || new Date()}
        onConfirm={(date) => {
          onEndTimeChange(date);
          hideEndTimePicker();
        }}
        onCancel={hideEndTimePicker}
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
