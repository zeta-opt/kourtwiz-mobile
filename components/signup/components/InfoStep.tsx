import React, { useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { z } from "zod";
import { useSignup } from "../SignupContext";
import { Picker } from "@react-native-picker/picker";

const schema = z.object({
  fullName: z
    .string()
    .refine((val) => val.trim() !== "", {
      message: "Full name is required",
    })
    .refine((val) => /^[A-Za-z\s]+$/.test(val), {
      message: "Only letters and spaces allowed",
    }),
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Please select your gender" }),
  }),
});

const InfoStep = ({ onNext }: { onNext: () => void }) => {
  const { data, updateData } = useSignup();
  const [name, setName] = useState(data.fullName || "");
  const [gender, setGender] = useState(data.gender || "");
  const [dob, setDob] = useState(data.dob || { month: "May", year: "2025" });

  const [errors, setErrors] = useState<{ fullName?: string; gender?: string; dob?: string }>({});

  const handleNext = () => {
    const parsed = schema.safeParse({ fullName: name, gender });
    const newErrors: typeof errors = {};
  
    // Schema-based validation
    if (!parsed.success) {
      parsed.error.errors.forEach((err) => {
        if (err.path[0] === "fullName") newErrors.fullName = err.message;
        if (err.path[0] === "gender") newErrors.gender = err.message;
      });
    }
  
    // DOB validation
    const selectedYear = parseInt(dob.year, 10);
    const currentYear = new Date().getFullYear();
    const age = currentYear - selectedYear;
  
    if (!dob.year || age < 13) {
      newErrors.dob = "You must be at least 13 years old";
    }
  
    // Show all errors if any
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    // If all good, reset errors and proceed
    setErrors({});
    updateData({ fullName: name, gender, dob });
    onNext();
  };

  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#116AAD" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Personal Info</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Full Name <Text style={{color: 'red'}}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#bbb"
            value={name}
            onChangeText={setName}
          />
          {errors.fullName && <Text style={styles.error}>{errors.fullName}</Text>}

          <Text style={styles.label}>Date of Birth <Text style={{color: 'red'}}>*</Text></Text>
          <View style={styles.dobRow}>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={dob.month}
                onValueChange={(itemValue) =>
                  setDob((prev) => ({ ...prev, month: itemValue }))
                }
                style={styles.picker}
              >
                {[
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ].map((month) => (
                  <Picker.Item label={month} value={month} key={month} />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={dob.year}
                onValueChange={(itemValue) =>
                  setDob((prev) => ({ ...prev, year: itemValue }))
                }
                style={styles.picker}
              >
                {Array.from({ length: 100 }, (_, i) => 2025 - i).map((year) => (
                  <Picker.Item
                    label={year.toString()}
                    value={year.toString()}
                    key={year}
                  />
                ))}
              </Picker>
            </View>
          </View>
          {errors.dob && <Text style={styles.error}>{errors.dob}</Text>}

          <Text style={styles.label}>Gender <Text style={{color: 'red'}}>*</Text></Text>
          <View style={styles.genderRow}>
            {["Male", "Female", "Other"].map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.genderBtn,
                  gender === g && styles.genderBtnSelected,
                ]}
                onPress={() => setGender(g)}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === g && styles.genderTextSelected,
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.gender && (
            <Text style={styles.error}>
              ⓘ {errors.gender}
            </Text>
          )}

          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default InfoStep;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop:0,
    backgroundColor: "#116AAD",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    color: "#333",
  },
  dobRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    marginRight: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: "#3F7CFF",
  },
  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 12,
  },
  genderBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#f1f1f1",
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  genderBtnSelected: {
    backgroundColor: "#3F7CFF",
    borderColor: "#3F7CFF",
  },
  genderText: {
    color: "#333",
    fontWeight: "600",
  },
  genderTextSelected: {
    color: "#fff",
  },
  nextBtn: {
    backgroundColor: "#3F7CFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginTop: 4,
    fontSize: 13,
  },
});
