import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getToken } from '@/shared/helpers/storeToken';
import { Court, Coach } from './types/PlaySessions';
import axios from 'axios';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

type CreateCoachSessionProps = {
  onSuccess?: () => void;
  onClose?: () => void;
};

const CreateCoachSession: React.FC<CreateCoachSessionProps> = ({ onSuccess, onClose }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId;
  const clubId = user?.userClubRole?.[0]?.clubId || "";

  const [formData, setFormData] = useState({
    courtName: "",
    courtId: "",
    coachName: "",
    coachId: "",
    startTime: "",
    durationMinutes: "",
    priceForPlay: "",
    skillLevel: "",
    maxPlayers: "",
  });

  const [courtsData, setCourtsData] = useState<Court[]>([]);
  const [coachesData, setCoachesData] = useState<Coach[]>([]);
  const [loadingCourts, setLoadingCourts] = useState(true);
  const [loadingCoaches, setLoadingCoaches] = useState(true);
  const [errorCourts, setErrorCourts] = useState<string | null>(null);
  const [errorCoaches, setErrorCoaches] = useState<string | null>(null);

  useEffect(() => {
    const loadCourts = async () => {
      try {
        const token = await getToken();
        const response = await axios.get(`${BASE_URL}/api/courts/club/${clubId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourtsData(response.data);
      } catch (err: any) {
        setErrorCourts(err.message || "Failed to load courts.");
      } finally {
        setLoadingCourts(false);
      }
    };

    if (clubId) {
      loadCourts();
    }
  }, [clubId]);

  useEffect(() => {
    const loadCoaches = async () => {
      try {
        const token = await getToken();
        const response = await axios.get(`${BASE_URL}/api/coaches/club/${clubId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCoachesData(response.data);
      } catch (err: any) {
        setErrorCoaches(err.message || "Failed to load coaches.");
      } finally {
        setLoadingCoaches(false);
      }
    };

    if (clubId) {
      loadCoaches();
    }
  }, [clubId]);

  useEffect(() => {
    const court = courtsData?.find((c) => c.name === formData.courtName);
    const coach = coachesData?.find((c) => c.name === formData.coachName);

    setFormData((prev) => ({
      ...prev,
      courtId: court?.id ?? "",
      coachId: coach?.id ?? "",
    }));
  }, [formData.courtName, formData.coachName, courtsData, coachesData]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const {
      courtId,
      coachId,
      startTime,
      durationMinutes,
      skillLevel,
      maxPlayers,
      priceForPlay,
    } = formData;

    if (!courtId || !coachId || !startTime || !durationMinutes || !skillLevel || !maxPlayers || !priceForPlay) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }

    const payload = {
      playTypeName: "COACH_SESSION",
      clubId,
      courtId,
      coachId,
      startTime,
      durationMinutes: Number(durationMinutes),
      priceForPlay: Number(priceForPlay),
      skillLevel,
      maxPlayers: Number(maxPlayers),
    };

    try {
      const token = await getToken();
      await axios.post(`${BASE_URL}/api/play-type/sessions`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      Alert.alert("Success", "Coach session created successfully!");
      setFormData({
        courtName: "",
        courtId: "",
        coachName: "",
        coachId: "",
        startTime: "",
        durationMinutes: "",
        priceForPlay: "",
        skillLevel: "",
        maxPlayers: "",
      });
      onSuccess?.();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create session");
    }
  };

  if (loadingCourts || loadingCoaches) {
    return <Text>Loading...</Text>;
  }

  if (errorCourts || errorCoaches) {
    return <Text style={{ color: 'red' }}>{errorCourts || errorCoaches}</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Court Name</Text>
      <Picker
        selectedValue={formData.courtName}
        onValueChange={(val) => handleInputChange("courtName", val)}
        style={styles.picker}
      >
        <Picker.Item label="Select a court" value="" />
        {courtsData.map((court) => (
          <Picker.Item key={court.id} label={court.name} value={court.name} />
        ))}
      </Picker>

      <Text style={styles.label}>Coach Name</Text>
      <Picker
        selectedValue={formData.coachName}
        onValueChange={(val) => handleInputChange("coachName", val)}
        style={styles.picker}
      >
        <Picker.Item label="Select a coach" value="" />
        {coachesData.map((coach) => (
          <Picker.Item key={coach.id} label={coach.name} value={coach.name} />
        ))}
      </Picker>

      <Text style={styles.label}>Start Time (YYYY-MM-DDTHH:MM)</Text>
      <TextInput
        style={styles.input}
        value={formData.startTime}
        onChangeText={(val) => handleInputChange("startTime", val)}
        placeholder="e.g. 2025-06-10T10:00"
      />

      <Text style={styles.label}>Duration (Minutes)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={formData.durationMinutes}
        onChangeText={(val) => handleInputChange("durationMinutes", val)}
      />

      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={formData.priceForPlay}
        onChangeText={(val) => handleInputChange("priceForPlay", val)}
      />

      <Text style={styles.label}>Skill Level</Text>
      <Picker
        selectedValue={formData.skillLevel}
        onValueChange={(val) => handleInputChange("skillLevel", val)}
        style={styles.picker}
      >
        <Picker.Item label="Select skill level" value="" />
        <Picker.Item label="Beginner" value="Beginner" />
        <Picker.Item label="Intermediate" value="Intermediate" />
        <Picker.Item label="Advanced" value="Advanced" />
      </Picker>

      <Text style={styles.label}>Max Players</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={formData.maxPlayers}
        onChangeText={(val) => handleInputChange("maxPlayers", val)}
      />

      <View style={styles.buttonGroup}>
        <Button title="Create Coach Session" onPress={handleSubmit} />
        <View style={styles.spacer} />
        <Button title="Cancel" color="red" onPress={onClose} />
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
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
  },
  buttonGroup: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  spacer: {
    width: 12,
  },
});

export default CreateCoachSession;