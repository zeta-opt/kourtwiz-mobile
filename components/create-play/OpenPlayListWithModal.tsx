import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import Constants from 'expo-constants';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getToken } from '@/shared/helpers/storeToken';
import { PlaySession, Court, Coach } from './types/PlaySessions';

const PLAY_TYPES = [
  { label: 'Open Play', value: 'OPEN_PLAY' },
  { label: 'Private Lesson', value: 'PRIVATE_LESSON' },
  { label: 'Group Lesson', value: 'GROUP_LESSON' },
  { label: 'Clinic', value: 'CLINIC' },
  { label: 'Tournament', value: 'TOURNAMENT' },
  { label: 'League', value: 'LEAGUE' },
  { label: 'Coach Session', value: 'COACH_SESSION' },
];

const EVENT_REPEAT_TYPES = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'DAYS'];

const WEEK_DAYS = [
  { label: 'Monday', value: 'MONDAY' },
  { label: 'Tuesday', value: 'TUESDAY' },
  { label: 'Wednesday', value: 'WEDNESDAY' },
  { label: 'Thursday', value: 'THURSDAY' },
  { label: 'Friday', value: 'FRIDAY' },
  { label: 'Saturday', value: 'SATURDAY' },
  { label: 'Sunday', value: 'SUNDAY' },
];

type CreateOpenPlayProps = {
  onSuccess?: () => void;
  onClose?: () => void;
};

const CreateOpenPlayForm: React.FC<CreateOpenPlayProps> = ({ onSuccess, onClose }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId;
  const clubId = user?.userClubRole?.[0]?.clubId || "";
  const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

  const [formData, setFormData] = useState<Omit<PlaySession, 'id' | 'registeredPlayers'> & { courtName: string }>({
  courtName: '', // UI-only
  courtId: '',
  playTypeName: 'OPEN_PLAY',
  startTime: '', // ⬅️ should be string
  durationMinutes: 0,
  priceForPlay: 0,
  skillLevel: '',
  maxPlayers: 0,
  eventRepeatType: 'NONE',
  repeatEndDate: '',
  repeatInterval: 0,
  repeatOnDays: [],
  coachId: '',
});


  const [courtsData, setCourtsData] = useState<Court[]>([]);
  const [coachesData, setCoachesData] = useState<Coach[]>([]);
  const [coachId, setCoachId] = useState('');

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const token = await getToken();
        const response = await axios.get(`${BASE_URL}/api/courts/club/${clubId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCourtsData(response.data || []);
      } catch (err) {
        console.error('Failed to load courts', err);
      }
    };

    if (clubId) fetchCourts();
  }, [clubId]);

  useEffect(() => {
    if (formData.playTypeName === 'COACH_SESSION' && clubId) {
      const fetchCoaches = async () => {
        try {
          const token = await getToken();
          const response = await axios.get(`${BASE_URL}/api/coaches/club/${clubId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setCoachesData(response.data || []);
        } catch (err) {
          console.error('Failed to load coaches', err);
        }
      };

      fetchCoaches();
    }
  }, [formData.playTypeName, clubId]);

  useEffect(() => {
    const matchedCourt = courtsData.find(
      (court) => court.name.toLowerCase() === formData.courtName.toLowerCase()
    );
    if (matchedCourt) {
      setFormData((prev) => ({ ...prev, courtId: matchedCourt.id }));
    }
  }, [formData.courtName, courtsData]);

  const handleSubmit = async () => {
    const required: (keyof typeof formData)[] = ['courtId', 'startTime', 'durationMinutes', 'priceForPlay', 'skillLevel', 'maxPlayers'];
    const isCoach = formData.playTypeName === 'COACH_SESSION';
    const hasAllFields = required.every((key) => formData[key]);

    if (!hasAllFields || (isCoach && !coachId)) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const payload = {
      ...formData,
      clubId,
      userId,
      durationMinutes: Number(formData.durationMinutes),
      priceForPlay: Number(formData.priceForPlay),
      maxPlayers: Number(formData.maxPlayers),
      coachId: isCoach ? coachId : null,
      registeredPlayers: [],
      repeatEndDate: formData.repeatEndDate ? `${formData.repeatEndDate}T00:00:00` : null,
      repeatInterval: formData.eventRepeatType !== 'NONE' ? Number(formData.repeatInterval) : null,
      repeatOnDays: formData.eventRepeatType === 'DAYS' ? formData.repeatOnDays : null,
    };

    try {
      const token = await getToken();
      await axios.post(`${BASE_URL}/api/play-type/sessions`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      Alert.alert('Success', 'Session created successfully!');
      onSuccess?.();
    } catch (err: any) {
      console.error('Error creating session:', err);
      Alert.alert('Error', err.message || 'Something went wrong');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Play Type</Text>
      <Picker
        selectedValue={formData.playTypeName}
        onValueChange={(val) => handleChange('playTypeName', val)}>
        {PLAY_TYPES.map((type) => (
          <Picker.Item key={type.value} label={type.label} value={type.value} />
        ))}
      </Picker>

      <Text style={styles.label}>Court</Text>
      <Picker
        selectedValue={formData.courtName}
        onValueChange={(val) => handleChange('courtName', val)}>
        <Picker.Item label="Select court" value="" />
        {courtsData.map((court) => (
          <Picker.Item key={court.id} label={court.name} value={court.name} />
        ))}
      </Picker>

      <TextInput style={styles.input} placeholder="Start Time (YYYY-MM-DDTHH:MM)" value={formData.startTime} onChangeText={(val) => handleChange('startTime', val)} />
      <TextInput style={styles.input} placeholder="Duration (minutes)" keyboardType="numeric" value={formData.durationMinutes.toString()} onChangeText={(val) => handleChange('durationMinutes', val)} />
      <TextInput style={styles.input} placeholder="Price ($)" keyboardType="numeric" value={formData.priceForPlay.toString()} onChangeText={(val) => handleChange('priceForPlay', val)} />

      <Text style={styles.label}>Skill Level</Text>
      <Picker selectedValue={formData.skillLevel} onValueChange={(val) => handleChange('skillLevel', val)}>
        <Picker.Item label="Beginner" value="Beginner" />
        <Picker.Item label="Intermediate" value="Intermediate" />
        <Picker.Item label="Advanced" value="Advanced" />
      </Picker>

      {formData.playTypeName === 'COACH_SESSION' && (
        <>
          <Text style={styles.label}>Coach</Text>
          <Picker selectedValue={coachId} onValueChange={(val) => setCoachId(val)}>
            <Picker.Item label="Select coach" value="" />
            {coachesData.map((coach) => (
              <Picker.Item key={coach.id} label={coach.name} value={coach.id} />
            ))}
          </Picker>
        </>
      )}

      <TextInput style={styles.input} placeholder="Max Players" keyboardType="numeric" value={formData.maxPlayers.toString()} onChangeText={(val) => handleChange('maxPlayers', val)} />

      <Text style={styles.label}>Repeat Type</Text>
      <Picker selectedValue={formData.eventRepeatType} onValueChange={(val) => handleChange('eventRepeatType', val)}>
        {EVENT_REPEAT_TYPES.map((type) => (
          <Picker.Item key={type} label={type} value={type} />
        ))}
      </Picker>

      {formData.eventRepeatType !== 'NONE' && (
        <>
          {formData.eventRepeatType === 'DAYS' ? (
            <>
              <Text style={styles.label}>Repeat On Days</Text>
              {WEEK_DAYS.map((day) => (
                <Button
                  key={day.value}
                  title={day.label}
                  color={formData.repeatOnDays?.includes(day.value) ? 'green' : 'gray'}
                  onPress={() => {
                    const days = formData.repeatOnDays?.includes(day.value)
                      ? formData.repeatOnDays.filter((d) => d !== day.value)
                      : [...(formData.repeatOnDays || []), day.value];
                    handleChange('repeatOnDays', days);
                  }}
                />
              ))}
            </>
          ) : (
            <TextInput style={styles.input} placeholder="Repeat Interval" keyboardType="numeric" value={formData.repeatInterval?.toString()} onChangeText={(val) => handleChange('repeatInterval', val)} />
          )}

          <TextInput style={styles.input} placeholder="Repeat End Date (YYYY-MM-DD)" value={formData.repeatEndDate} onChangeText={(val) => handleChange('repeatEndDate', val)} />
        </>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Create Session" onPress={handleSubmit} />
        <Button title="Cancel" onPress={onClose} color="red" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 4,
    borderRadius: 4,
  },
  buttonContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
});

export default CreateOpenPlayForm;