import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  Button,
  Modal,
  Portal,
  Text,
  TextInput,
  Dialog,
  Paragraph
} from 'react-native-paper';
import { useForgotPassword } from '@/hooks/apis/authentication/useForgotPassword';
import { useResetPassword } from '@/hooks/apis/authentication/useResetPassword';

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

const ForgotPasswordModal = ({ visible, onDismiss }: Props) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const { forgotPassword, status: forgotStatus } = useForgotPassword();
  const { resetPassword, status: resetStatus } = useResetPassword();

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setShowErrorDialog(true);
    setTimeout(() => {
      setShowErrorDialog(false);
      setErrorMsg(null);
    }, 2000);
  };

  const handleSendOtp = async () => {
    if (!email) return showError('Email is required');

    await forgotPassword(email, {
      onSuccess: () => setStep(2),
      onError: (err) =>
        showError(err?.response?.data?.message || 'Failed to send OTP'),
    });
  };

  const handleResetPassword = async () => {
    if (!otp) return showError('OTP is required');
    if (!newPassword) return showError('New password is required');

    await resetPassword(
      { email, otp, newPassword },
      {
        onSuccess: () => {
          setShowSuccessDialog(true);
          setTimeout(() => {
            setShowSuccessDialog(false);
            resetForm();
            onDismiss();
          }, 2000);
        },
        onError: (err) =>
          showError(err?.response?.data?.message || 'Invalid OTP or reset failed'),
      }
    );
  };

  const resetForm = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setErrorMsg(null);
    setShowErrorDialog(false);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={() => {
          resetForm();
          onDismiss();
        }}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>Forgot Password</Text>

        {step === 1 && (
          <>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={handleSendOtp}
              loading={forgotStatus === 'loading'}
              style={styles.button}
            >
              Send OTP
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <TextInput
              label="OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={handleResetPassword}
              loading={resetStatus === 'loading'}
              style={styles.button}
            >
              Reset Password
            </Button>
          </>
        )}
      </Modal>

      {/* ✅ Success Dialog */}
      <Dialog visible={showSuccessDialog} dismissable={false}>
        <Dialog.Icon icon="check-circle" />
        <Dialog.Title>Password Reset</Dialog.Title>
        <Dialog.Content>
          <Paragraph>Password changed successfully!</Paragraph>
        </Dialog.Content>
      </Dialog>

      {/* ❌ Error Dialog */}
      <Dialog visible={showErrorDialog} onDismiss={() => setShowErrorDialog(false)}>
        <Dialog.Icon icon="alert-circle" />
        <Dialog.Title>Error</Dialog.Title>
        <Dialog.Content>
          <Paragraph>{errorMsg}</Paragraph>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
});

export default ForgotPasswordModal;
