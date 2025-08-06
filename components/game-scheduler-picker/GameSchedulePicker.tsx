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
}

const GameSchedulePicker: React.FC<GameSchedulePickerProps> = ({
  selectedDate,
  startTime,
  endTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
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
    const newTime = selectedDate ? new Date(selectedDate) : new Date();
    newTime.setHours(time.getHours(), time.getMinutes(), 0);
    onStartTimeChange(newTime);
    hideStartTimePicker();
  };

  const showEndTimePicker = () => setEndTimePickerVisibility(true);
  const hideEndTimePicker = () => setEndTimePickerVisibility(false);
  const handleEndTimeConfirm = (time: Date) => {
    const newTime = selectedDate ? new Date(selectedDate) : new Date();
    newTime.setHours(time.getHours(), time.getMinutes(), 0);
    onEndTimeChange(newTime);
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
            style={[
              styles.dateTimeButton,
              styles.roundedButton,
              styles.whiteButton,
              styles.blackBorder,
            ]}
            onPress={showDatePicker}
            contentStyle={styles.fullWidth} // 👈 new
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
            <Text style={styles.inputLabel}>Duration *</Text>
            <Button
              mode='outlined'
              style={[
                styles.dateTimeButton,
                styles.roundedButton,
                styles.whiteButton,
                styles.blackBorder,
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
                  {startTime
                    ? startTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Start Time'}
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
            <Text style={styles.inputLabel}>Duration *</Text>
            <Button
              mode='outlined'
              style={[
                styles.dateTimeButton,
                styles.roundedButton,
                styles.whiteButton,
                styles.blackBorder,
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
                  {endTime
                    ? endTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'End Time'}
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
        minimumDate={new Date(2000, 0, 1)}
        maximumDate={new Date(2100, 11, 31)}
      />

      {/* Start Time Picker */}
      <DateTimePickerModal
        isVisible={isStartTimePickerVisible}
        mode='time'
        date={startTime || new Date()}
        onConfirm={handleStartTimeConfirm}
        onCancel={hideStartTimePicker}
        display='spinner'
      />

      {/* End Time Picker */}
      <DateTimePickerModal
        isVisible={isEndTimePickerVisible}
        mode='time'
        date={endTime || startTime || new Date()}
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
