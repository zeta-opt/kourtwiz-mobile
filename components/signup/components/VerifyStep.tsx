import { useMutation } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PhoneInput from "react-native-phone-number-input";
import { z } from "zod";
import {
  sendEmailOtp,
  sendPhoneOtp,
  validateEmailOtp,
  validatePhoneOtp,
} from "../api/api";
import { useSignup } from "../SignupContext";

const schema = z.object({
  phone: z.string().min(10, "Phone number is required"),
  phoneOtp: z.string().length(6, "OTP must be 6 digits"),
  email: z.string().email("Invalid email address"),
  emailOtp: z.string().length(6, "OTP must be 6 digits"),
});

const ContactDetails = ({ onNext }: { onNext: () => void }) => {
  const { updateData } = useSignup();
  const phoneInputRef = useRef<PhoneInput>(null);
  const [phone, setPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");

  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState({});
  const [failMsg, setFailMsg] = useState({});

  const sendPhoneOtpMutation = useMutation({
    mutationFn: () => sendPhoneOtp(phone),
    onSuccess: () => {
      setPhoneOtpSent(true);
      Alert.alert("Success", "Phone OTP sent");
    },
    onError: () => Alert.alert("Error", "Failed to send phone OTP"),
  });

  const validatePhoneOtpMutation = useMutation({
    mutationFn: () => validatePhoneOtp(phone, phoneOtp),
    onSuccess: () => {
      setPhoneVerified(true);
      setSuccessMsg((prev) => ({
        ...prev,
        phone: "Phone number verified successfully",
      }));
      setFailMsg((prev) => ({ ...prev, phone: "" }));
    },
    onError: () => {
      setFailMsg((prev) => ({
        ...prev,
        phone: "Invalid OTP. Please contact support.",
      }));
      setSuccessMsg((prev) => ({ ...prev, phone: "" }));
    },
  });

  const sendEmailOtpMutation = useMutation({
    mutationFn: () => sendEmailOtp(email),
    onSuccess: () => {
      setEmailOtpSent(true);
      Alert.alert("Success", "Email OTP sent");
    },
    onError: () => Alert.alert("Error", "Failed to send email OTP"),
  });

  const validateEmailOtpMutation = useMutation({
    mutationFn: () => validateEmailOtp(email, emailOtp),
    onSuccess: () => {
      setEmailVerified(true);
      setSuccessMsg((prev) => ({
        ...prev,
        email: "Email verified successfully",
      }));
      setFailMsg((prev) => ({ ...prev, email: "" }));
    },
    onError: () => {
      setFailMsg((prev) => ({
        ...prev,
        email: "Invalid OTP. Please contact support.",
      }));
      setSuccessMsg((prev) => ({ ...prev, email: "" }));
    },
  });

  const handlePhoneOtpVerify = () => {
    if (phoneOtp.length !== 6) {
      setErrors((prev) => ({ ...prev, phoneOtp: "OTP must be 6 digits" }));
      return;
    }
    setErrors((prev) => ({ ...prev, phoneOtp: "" }));
    validatePhoneOtpMutation.mutate();
  };

  const handleEmailOtpVerify = () => {
    if (emailOtp.length !== 6) {
      setErrors((prev) => ({ ...prev, emailOtp: "OTP must be 6 digits" }));
      return;
    }
    setErrors((prev) => ({ ...prev, emailOtp: "" }));
    validateEmailOtpMutation.mutate();
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
        <Text style={styles.title}>Contact Details</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Phone Number</Text>
          <PhoneInput
            ref={phoneInputRef}
            defaultCode="US"
            layout="first"
            onChangeFormattedText={setPhone}
            containerStyle={styles.phoneContainer}
            textContainerStyle={styles.textInput}
            textInputStyle={styles.phoneTextInput}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          {failMsg.phone && (
            <Text style={styles.failText}>{failMsg.phone}</Text>
          )}
          {successMsg.phone && (
            <Text style={styles.successText}>{successMsg.phone}</Text>
          )}

          {!phoneVerified && phoneOtpSent && (
            <>
              <Text style={styles.label}>Phone OTP</Text>
              <TextInput
                style={[styles.input, errors.phoneOtp && styles.errorInput]}
                placeholder="Phone OTP"
                keyboardType="numeric"
                maxLength={6}
                value={phoneOtp}
                onChangeText={setPhoneOtp}
              />
              {errors.phoneOtp && (
                <Text style={styles.errorText}>{errors.phoneOtp}</Text>
              )}
              <TouchableOpacity onPress={handlePhoneOtpVerify}>
                <Text style={styles.otpLink}>Verify Phone</Text>
              </TouchableOpacity>
            </>
          )}

          {!phoneOtpSent && !phoneVerified && (
            <TouchableOpacity onPress={() => sendPhoneOtpMutation.mutate()}>
              <Text style={styles.otpLink}>Send OTP</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, errors.email && styles.errorInput]}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          {failMsg.email && (
            <Text style={styles.failText}>{failMsg.email}</Text>
          )}
          {successMsg.email && (
            <Text style={styles.successText}>{successMsg.email}</Text>
          )}

          {!emailVerified && emailOtpSent && (
            <>
              <Text style={styles.label}>Email OTP</Text>
              <TextInput
                style={[styles.input, errors.emailOtp && styles.errorInput]}
                placeholder="Email OTP"
                keyboardType="numeric"
                maxLength={6}
                value={emailOtp}
                onChangeText={setEmailOtp}
              />
              {errors.emailOtp && (
                <Text style={styles.errorText}>{errors.emailOtp}</Text>
              )}
              <TouchableOpacity onPress={handleEmailOtpVerify}>
                <Text style={styles.otpLink}>Verify Email</Text>
              </TouchableOpacity>
            </>
          )}

          {!emailVerified && (
            <TouchableOpacity onPress={() => sendEmailOtpMutation.mutate()}>
              <Text style={styles.otpLink}>
                {emailOtpSent ? "Resend OTP" : "Send OTP"}
              </Text>
            </TouchableOpacity>
          )}

          {phoneVerified && emailVerified && (
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => {
                updateData({ phone, email });
                onNext();
              }}
            >
              <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ContactDetails;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
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
  errorInput: {
    borderColor: "red",
  },
  phoneContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#f9f9f9",
    height: 56,
    overflow: "hidden",
  },
  textInput: {
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    height: "100%",
    paddingLeft: 0,
  },
  phoneTextInput: {
    fontSize: 15,
    paddingLeft: 0,
    marginLeft: 0,
    color: "#000",
    height: 56,
  },
  otpLink: {
    color: "#3F7CFF",
    fontWeight: "600",
    marginTop: 6,
  },
  errorText: {
    color: "red",
    fontSize: 13,
    marginTop: 4,
  },
  successText: {
    color: "green",
    fontSize: 13,
    marginTop: 4,
  },
  failText: {
    color: "red",
    fontSize: 13,
    marginTop: 4,
    fontStyle: "italic",
  },
  nextBtn: {
    backgroundColor: "#3F7CFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
