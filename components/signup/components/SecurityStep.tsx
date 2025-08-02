import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSignup } from '../SignupContext';
import { z } from 'zod';

const schema = z.object({
  password: z
    .string()
    .min(8, 'Password must be 8-16 characters')
    .max(16, 'Password must be 8-16 characters')
    .regex(/[a-zA-Z]/, 'Password must include letters')
    .regex(/[0-9]/, 'Password must include numbers')
    .regex(/[!@#$%^&*]/, 'Password must include special characters (!@#$%^&*)'),
});

const SecurityStep = ({ onNext, onBack }) => {
  const { data, updateData } = useSignup();
  const [password, setPassword] = useState(data.password || '');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [secure, setSecure] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const isLengthValid = password.length >= 8 && password.length <= 16;
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const passwordsMatch = password && confirm && password === confirm;

  const handleNext = () => {
    const result = schema.safeParse({ password });
    if (!result.success) {
      setErrors({ password: result.error.errors[0].message });
      return;
    }
    if (!passwordsMatch) {
      setErrors({ confirm: 'Passwords do not match' });
      return;
    }
    setErrors({});
    updateData({ password });
    onNext();
  };

  const renderCriteria = (isValid, text) => (
    <Text style={[styles.criteria, isValid && styles.criteriaPassed]}>
      <Text style={[styles.criteriaDot, isValid ? styles.criteriaDotFilled : styles.criteriaDotEmpty]}>●</Text> {text}
    </Text>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#116AAD' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Security</Text>
        <View style={styles.card}>
          <Text style={styles.label}>
            Password <Text style={{color: 'red'}}>*</Text>
            </Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={secure}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setSecure(!secure)}>
              <Text style={styles.eyeIcon}>{secure ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <Text style={styles.label}>
            Confirm Password <Text style={{color: 'red'}}>*</Text>
            </Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry={secureConfirm}
              value={confirm}
              onChangeText={setConfirm}
            />
            <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)}>
              <Text style={styles.eyeIcon}>{secureConfirm ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          {errors.confirm && <Text style={styles.errorText}>{errors.confirm}</Text>}

          <View style={styles.criteriaList}>
            {renderCriteria(isLengthValid, '8-16 characters')}
            {renderCriteria(hasLetters, 'Letters (a-z, A-Z)')}
            {renderCriteria(hasNumbers, 'Numbers (0-9)')}
            {renderCriteria(hasSpecial, 'Special characters (!@#$%^&*)')}
            {renderCriteria(passwordsMatch, 'Passwords must match')}
          </View>

          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SecurityStep;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
    color: '#000',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginTop: 4,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f8f8f8',
  },
  eyeIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  criteriaList: {
    marginTop: 12,
    marginBottom: 24,
  },
  criteria: {
    fontSize: 13,
    marginVertical: 4,
    color: '#777',
  },
  criteriaPassed: {
    color: 'green',
  },
  criteriaDot: {
    fontSize: 16,
  },
  criteriaDotFilled: {
    color: 'green',
  },
  criteriaDotEmpty: {
    color: '#ccc',
  },
  nextBtn: {
    backgroundColor: '#3F7CFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
