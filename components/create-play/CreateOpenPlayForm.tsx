import React, { useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  Pressable,
} from 'react-native';
import {
  Button,
  Text,
  TextInput,
  Portal,
  Modal,
  HelperText,
  Checkbox,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Controller, useForm } from 'react-hook-form';
import { Dropdown } from 'react-native-paper-dropdown';

import { useGetClubCourt } from '@/hooks/apis/courts/useGetClubCourts';
import {useGetClubCoach} from '@/hooks/apis/coach/useGetClubCoach';
import { useCreateOpenPlaySession } from '@/hooks/apis/createPlay/useCreateOpenPlay';

type Props = {
  clubId: string;
  onClose: () => void;
  onSuccess: () => void;
  visible: boolean;
  currentClubId: string;
  refetch: () => void;
};

export type PlaySession = {
  clubtId: string;
  courtId: string;
  coachId?: string;
  playTypeName: string;
  startTime: string;
  durationMinutes: number;
  priceForPlay: number;
  skillLevel: string;
  maxPlayers: number;
  eventRepeatType: string;
  repeatEndDate?: string;
  repeatInterval?: number;
  repeatOnDays?: string[];
  sessionFull?: boolean;
};

export type Court = {
  id: string;
  name: string;
};

export type Coach = {
  id: string;
  name: string;
  email?: string;
};

const PLAY_TYPES = [
  { label: 'Open Play', value: 'OPEN_PLAY' },
  { label: 'Private Lesson', value: 'PRIVATE_LESSON' },
  { label: 'Group Lesson', value: 'GROUP_LESSON' },
  { label: 'Clinic', value: 'CLINIC' },
  { label: 'Tournament', value: 'TOURNAMENT' },
  { label: 'League', value: 'LEAGUE' },
  { label: 'Coach Session', value: 'COACH_SESSION' },
];

const SKILL_LEVELS = [
  { label: 'Beginner', value: 'BEGINNER' },
  { label: 'Intermediate', value: 'INTERMEDIATE' },
  { label: 'Advanced', value: 'ADVANCED' },
];

const EVENT_REPEAT_TYPES = [
  { label: 'None', value: 'NONE' },
  { label: 'Daily', value: 'DAILY' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
];

const WEEK_DAYS = [
  { label: "Monday", value: "MONDAY" },
  { label: "Tuesday", value: "TUESDAY" },
  { label: "Wednesday", value: "WEDNESDAY" },
  { label: "Thursday", value: "THURSDAY" },
  { label: "Friday", value: "FRIDAY" },
  { label: "Saturday", value: "SATURDAY" },
  { label: "Sunday", value: "SUNDAY" },
];

export const CreateOpenPlayForm = ({ clubId ,onClose, onSuccess, visible }: Props) => {
  const [modalVisible, setModalVisible] = useState(visible);
  const [courts, setCourts] = useState<Court[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [currentField, setCurrentField] = useState<'startTime' | 'repeatEndDate'>('startTime');
  const [showWeekDaysDropdown, setShowWeekDaysDropdown] = useState(false);

  const { data: courtData=[] } = useGetClubCourt({ clubId });
  const { data: coachData=[]} = useGetClubCoach({ clubId });
  const { createSession } = useCreateOpenPlaySession();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<PlaySession>({
    defaultValues: {
      playTypeName: 'OPEN_PLAY',
      eventRepeatType: 'NONE',
      durationMinutes: 60,
      maxPlayers: 4,
      priceForPlay: 0,
      skillLevel: 'BEGINNER',
    },
  });

  const watchedPlayType = watch('playTypeName');
  const watchedRepeatType = watch('eventRepeatType');

  const formatPrice = (value: string | number): string => {
    if (value === null || value === undefined) return '';
    const strValue = value.toString();
    const sanitized = strValue.replace(/[^0-9.]/g, '').replace(/^0+/, '') || '0';
    const [intPart, decPart] = sanitized.split('.');
    const intFormatted = intPart ? parseInt(intPart, 10).toLocaleString('en-US') : '0';
    return decPart !== undefined ? `$${intFormatted}.${decPart.slice(0, 2)}` : `$${intFormatted}`;
  };  

  const unformatPrice = (value: string): string => value.replace(/[^0-9.]/g, '');

  // Format date to dd/mm/yyyy, hh:mm
  const formatDateTime = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  };

  // Parse dd/mm/yyyy, hh:mm back to Date
  const parseDateTime = (dateString: string) => {
    if (!dateString) return new Date();
    
    const [datePart, timePart] = dateString.split(', ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes] = timePart?.split(':') || ['00', '00'];
    
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
    );
  };

  const handleDateTimePress = (field: 'startTime' | 'repeatEndDate') => {
    setCurrentField(field);
    setPickerMode(field === 'repeatEndDate' ? 'date' : 'date');
    setShowPicker(true);
  };

  const tempDateRef = useRef<Date | null>(null);
  const handleDateTimeChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      if (pickerMode === 'time') {
        tempDateRef.current = null;
        setPickerMode('date');
      }
      setShowPicker(false);
      return;
    }
  
    if (!selectedDate) return;
  
    if (currentField === 'repeatEndDate') {
      // Only pick the date part — no time needed
      const formatted = formatDateTime(selectedDate).split(',')[0] + ', 00:00';
      setValue('repeatEndDate', formatted, { shouldValidate: true });
      setShowPicker(false);
      return;
    }
  
    // For startTime: Handle date ➜ then time
    if (pickerMode === 'date') {
      tempDateRef.current = selectedDate;
      setPickerMode('time');
      setShowPicker(true);
    } else {
      const fullDate = new Date(tempDateRef.current || new Date());
      fullDate.setHours(selectedDate.getHours());
      fullDate.setMinutes(selectedDate.getMinutes());
  
      const formatted = formatDateTime(fullDate);
      setValue('startTime', formatted, { shouldValidate: true });
  
      tempDateRef.current = null;
      setShowPicker(false);
      setPickerMode('date');
    }
  };    

  useEffect(() => {
    setModalVisible(visible);
    if (!visible) {
      reset();
    }
  }, [visible, reset]);
  
  useEffect(() => {
    if (courtData) {
      setCourts(
        courtData.map((court: any) => ({
          id: court.id,
          name: court.name,
        }))
      );
    }
   
    if (watchedPlayType === 'COACH_SESSION' && coachData) {
      setCoaches(
        coachData.map((coach: any) => ({
          id: coach.id,
          name: coach.name,
          email: coach.email,
        }))
      );
    }
  }, [courtData, coachData, watchedPlayType]);

  const onSubmit = async (data: PlaySession) => {
    setIsLoading(true);
    try {
      const endDate = data.repeatEndDate ? parseDateTime(data.repeatEndDate) : undefined;
  
      const payload = {
        playTypeName: data.playTypeName,
        clubId: clubId,
        courtId: data.courtId,
        startTime: parseDateTime(data.startTime).toISOString(),
        durationMinutes: Number(data.durationMinutes),
        priceForPlay: Number(unformatPrice(data.priceForPlay.toString())),
        skillLevel: data.skillLevel,
        maxPlayers: Number(data.maxPlayers),
        eventRepeatType: data.eventRepeatType,
        ...(data.eventRepeatType !== 'NONE' && {
          repeatInterval: Number(data.repeatInterval),
          repeatEndDate: endDate ? endDate.toISOString() : undefined,
          ...(data.eventRepeatType === 'WEEKLY' && {
            repeatOnDays: data.repeatOnDays,
          }),
        }),
        ...(watchedPlayType === 'COACH_SESSION' && {
          coachId: data.coachId,
        }),
      };
  
      await createSession(payload);
      Alert.alert('Success', 'Session created successfully');
      onSuccess();
    } catch (err: any) {
      console.error('Error creating session:', err);
      Alert.alert('Error', err.message || 'Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };  

  const onPressSubmit = () => {
    Alert.alert(
      'Confirm Submission',
      'Are you sure you want to create this play session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: () => handleSubmit(onSubmit)() },
      ]
    );
  };

  const handleDismiss = () => {
    setModalVisible(false);
    onClose();
  };

  return (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Text variant="titleLarge" style={styles.title}>Create Play Session</Text>

        <ScrollView contentContainerStyle={styles.formContainer}>
          <Controller
            name="playTypeName"
            control={control}
            rules={{ required: 'Play Type is required' }}
            render={({ field }) => (
            <View style={styles.input}>
              <Dropdown
                label="Play Type"
                mode="outlined"
                value={field.value}
                onSelect={field.onChange}
                options={PLAY_TYPES}
                error={!!errors.playTypeName}
              />
            </View>
            )}
          />
          {errors.playTypeName && <HelperText type="error">{errors.playTypeName.message}</HelperText>}

          <Controller
            name="courtId"
            control={control}
            rules={{ required: 'Court is required' }}
            render={({ field }) => (
            <View style={styles.input}>
              <Dropdown
                label="Court"
                mode="outlined"
                value={field.value}
                onSelect={field.onChange}
                options={courts.map(c => ({ label: c.name, value: c.id }))}
                error={!!errors.courtId}
              />
            </View>
            )}
          />
          {errors.courtId && <HelperText type="error">{errors.courtId.message}</HelperText>}

          <Controller
            name="startTime"
            control={control}
            rules={{ required: 'Start time is required' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Start Time"
                value={value ? formatDateTime(parseDateTime(value)) : ''}
                onChange={onChange}
                editable={false}
                onTouchStart={() => handleDateTimePress('startTime')}
                mode="outlined"
                error={!!errors.startTime}
                style={styles.input}
                right={
                  <TextInput.Icon 
                    icon="calendar" 
                    onPress={() => handleDateTimePress('startTime')} 
                  />
                }
              />
            )}
          />
          {errors.startTime && (<HelperText type="error">{errors.startTime.message}</HelperText>)}

          <Controller
            name="durationMinutes"
            control={control}
            rules={{ 
              required: 'Duration is required',
              min: { value: 1, message: 'Duration must be at least 1 minute' }
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Duration (minutes)"
                value={value?.toString()}
                onChangeText={onChange}
                keyboardType="numeric"
                mode="outlined"
                error={!!errors.durationMinutes}
                style={styles.input}
              />
            )}
          />
          {errors.durationMinutes && (<HelperText type="error">{errors.durationMinutes.message}</HelperText>)}

          <Controller
            name="priceForPlay"
            control={control}
            rules={{ 
              required: 'Price is required',
              min: { value: 0, message: 'Price cannot be negative' }
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Price"
                placeholder="$0.00"
                value={formatPrice(value?.toString())}
                onChangeText={val => onChange(unformatPrice(val))}
                keyboardType="decimal-pad"
                mode="outlined"
                error={!!errors.priceForPlay}
                style={styles.input}
              />
            )}
          />
          {errors.priceForPlay && (<HelperText type="error">{errors.priceForPlay.message}</HelperText>)}
            
          <Controller
            name="skillLevel"
            control={control}
            rules={{ required: 'Skill level is required' }}
            render={({ field }) => (
            <View style={styles.input}>
              <Dropdown
                label="Skill Level"
                mode="outlined"
                value={field.value}
                onSelect={field.onChange}
                options={SKILL_LEVELS}
                error={!!errors.skillLevel}
              />
            </View>
            )}
          />
          {errors.skillLevel && <HelperText type="error">{errors.skillLevel.message}</HelperText>}

          {watchedPlayType === 'COACH_SESSION' && (
            <Controller
              name="coachId"
              control={control}
              rules={{ required: 'Coach is required for coach sessions' }}
              render={({ field }) => (
              <View style={styles.input}>
                <Dropdown
                  label="Coach"
                  mode="outlined"
                  value={field.value}
                  onSelect={field.onChange}
                  options={coaches.map(c => ({ label: c.name, value: c.id }))}
                />
              </View>
              )}
            />
          )}
          {errors.coachId && <HelperText type="error">{errors.coachId.message}</HelperText>}

          <Controller
            name="maxPlayers"
            control={control}
            rules={{ 
              required: 'Max players is required',
              min: { value: 1, message: 'Must have at least 1 player' }
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Max Players"
                value={value?.toString()}
                onChangeText={onChange}
                keyboardType="numeric"
                mode="outlined"
                error={!!errors.maxPlayers}
                style={styles.input}
              />
            )}
          />
          {errors.maxPlayers && (<HelperText type="error">{errors.maxPlayers.message}</HelperText>)}
          
          <Controller
            name="eventRepeatType"
            control={control}
            render={({ field }) => (
              <View style={styles.input}>
                <Dropdown
                  label="Repeat Type"
                  mode="outlined"
                  value={field.value}
                  onSelect={field.onChange}
                  options={EVENT_REPEAT_TYPES}
                  error={!!errors.eventRepeatType}
                />
              </View>
            )}
          />
          {errors.eventRepeatType && (<HelperText type="error">{errors.eventRepeatType.message}</HelperText>)}

          {watchedRepeatType !== 'NONE' && (
            <>
              <Controller
                name="repeatInterval"
                control={control}
                rules={{ 
                  required: 'Repeat interval is required',
                  min: { value: 1, message: 'Interval must be at least 1' }
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Repeat Interval"
                    value={value?.toString()}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    mode="outlined"
                    error={!!errors.repeatInterval}
                    style={styles.input}
                  />
                )}
              />
              {errors.repeatInterval && (<HelperText type="error">{errors.repeatInterval.message}</HelperText>)}

            <Controller
              name="repeatEndDate"
              control={control}
              rules={{ required: 'End date is required for repeating events' }}
              render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Repeat End Date"
                    value={value ? formatDateTime(parseDateTime(value)).split(',')[0] : ''}
                    onChangeText={onChange}
                    editable={false}
                    onTouchStart={() => handleDateTimePress('repeatEndDate')}
                    mode="outlined"
                    error={!!errors.repeatEndDate}
                    style={styles.input}
                    right={
                      <TextInput.Icon 
                        icon="calendar" 
                        onPress={() => handleDateTimePress('repeatEndDate')} 
                      />
                    }
                  />
              )}
            />
            {errors.repeatEndDate && (<HelperText type="error">{errors.repeatEndDate.message}</HelperText>)}

          {watchedRepeatType === 'WEEKLY' && (
            <Controller
              name="repeatOnDays"
              control={control}
              rules={{ required: 'Select at least one weekday' }}
              render={({ field }) => (
                <>
                  <Pressable onPress={() => setShowWeekDaysDropdown(true)}>
                    <TextInput
                      label="Repeat On Days"
                      value={field.value?.join(', ')}
                      editable={false}
                      mode="outlined"
                      style={styles.input}
                      right={<TextInput.Icon icon="chevron-down" onPress={() => setShowWeekDaysDropdown(true)} />}
                      error={!!errors.repeatOnDays}
                    />
                  </Pressable>
                  <Portal>
                    <Modal
                      visible={showWeekDaysDropdown}
                      onDismiss={() => setShowWeekDaysDropdown(false)}
                      contentContainerStyle={styles.weekDaysModal}
                    >
                      <Text style={styles.label}>Select Days</Text>
                      {WEEK_DAYS.map((day) => (
                        <Checkbox.Item
                          key={day.value}
                          label={day.label}
                          status={field.value?.includes(day.value) ? 'checked' : 'unchecked'}
                          onPress={() => {
                            const updated = field.value?.includes(day.value)
                              ? field.value.filter((d) => d !== day.value)
                              : [...(field.value ?? []), day.value];
                            field.onChange(updated);
                          }}
                        />
                      ))}
                      <Button onPress={() => setShowWeekDaysDropdown(false)}>Done</Button>
                    </Modal>
                  </Portal>
                  {errors.repeatOnDays && <HelperText type="error">{errors.repeatOnDays.message}</HelperText>}
                </>
              )}
            />
          )}
        </>
      )}
      {/* Date/Time Picker */}
      {showPicker && (
          <DateTimePicker
            key={currentField}
            value={(() => {
              const fieldValue = getValues(currentField);
              return fieldValue ? parseDateTime(fieldValue) : new Date();
            })()}
            mode={pickerMode}
            display="default"
            onChange={handleDateTimeChange}
          />
        )}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={handleDismiss} style={styles.button}>
            Cancel
          </Button>
          <Button 
            mode="contained" 
            onPress={onPressSubmit} 
            style={styles.button} 
            loading={isLoading}
            disabled={isLoading}
          >
            Create Session
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    maxHeight: '90%',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  formContainer: {
    paddingBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingTop: 10,
  },
  button: {
    flex: 1,
  },
  outlinedBox: {
    backgroundColor:'rgb(245, 237, 245)',
    borderWidth: 1.2,
    borderColor: '#999',
    borderRadius: 4,
    marginTop:10,
    marginBottom:10,
  },  
  checkboxGroup: {
    flexDirection: 'column',
    marginVertical: 8,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  weekDaysModal: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 8,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 20,
    textAlign:'center'
  },
});

export default CreateOpenPlayForm;