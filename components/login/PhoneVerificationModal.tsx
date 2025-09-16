import { useEffect, useState } from 'react';
import { Button, Dialog, Portal, Text, TextInput } from 'react-native-paper';
import { sendPhoneOtp, validatePhoneOtp, verifyPhone } from '../signup/api/api';

type PhoneVerificationModalProps = {
  visible: boolean;
  onDismiss: () => void;
  phoneNumber: string;
  userId: string;
  onSuccess: () => void;
};

export function PhoneVerificationModal({
  visible,
  onDismiss,
  phoneNumber,
  userId,
  onSuccess,
}: PhoneVerificationModalProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (visible) {
      handleSendOtp();
      setTimer(120); // 2 minutes
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [visible]);

  const handleSendOtp = async () => {
    try {
      setError('');
      setLoading(true);
      await sendPhoneOtp(phoneNumber);
      setTimer(120); // reset timer on resend
    } catch (e) {
      setError('Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setError('');
      setLoading(true);
      await validatePhoneOtp(phoneNumber, otp);
      await verifyPhone(userId);
      onSuccess();
      onDismiss();
    } catch (e) {
      setError('Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // format mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Verify Phone</Dialog.Title>
        <Dialog.Content>
          <Text>Phone: {phoneNumber}</Text>
          <TextInput
            label='OTP'
            value={otp}
            onChangeText={setOtp}
            keyboardType='number-pad'
            style={{ marginTop: 10 }}
          />
          {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}

          {timer > 0 ? (
            <Text style={{ marginTop: 10, color: 'gray' }}>
              Resend available in {formatTime(timer)}
            </Text>
          ) : (
            <Button onPress={handleSendOtp} disabled={loading}>
              Resend OTP
            </Button>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          {timer === 120 && (
            <Button onPress={handleSendOtp} disabled={loading}>
              Send SMS
            </Button>
          )}
          <Button onPress={handleVerifyOtp} disabled={loading}>
            Verify
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
