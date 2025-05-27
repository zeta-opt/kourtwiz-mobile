import { useChangePassword } from '@/hooks/apis/authentication/useChangePassword';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { z } from 'zod';

// Schema definition using Zod
const loginSchema = z.object({
  username: z.string().email({ message: 'Invalid email address' }),
  tempPassword: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
  newPassword: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormData = z.infer<typeof loginSchema>;
type Props = {
  handleFirstTimeLogin: (val: boolean) => void;
};
export default function LoginFirstTime({ handleFirstTimeLogin }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const { changePassword, status } = useChangePassword();
  const handleSuccess = async (resData: any) => {
    console.log('is first time login data : ', resData);
    handleFirstTimeLogin(false);
    router.push('/(authenticated)/home');
  };

  const handleError = () => {
    console.log('login failed');
  };

  const onSubmit = async (data: LoginFormData) => {
    await changePassword(data, {
      onSuccess: handleSuccess,
      onError: handleError,
    });
    router.push('/(authenticated)/home');
  };

  return (
    <View style={styles.container}>
      <Text variant='headlineMedium' style={styles.title}>
        Login First Time
      </Text>
      <Controller
        control={control}
        name='username'
        render={({ field: { onChange, value } }) => (
          <TextInput
            label='Email'
            value={value}
            onChangeText={onChange}
            autoCapitalize='none'
            keyboardType='email-address'
            style={styles.input}
            error={!!errors.username}
          />
        )}
      />
      {errors.username && (
        <Text style={styles.error}>{errors.username.message}</Text>
      )}

      <Controller
        control={control}
        name='tempPassword'
        render={({ field: { onChange, value } }) => (
          <TextInput
            label='Old Password'
            value={value}
            onChangeText={onChange}
            secureTextEntry
            style={styles.input}
            error={!!errors.tempPassword}
          />
        )}
      />
      {errors.tempPassword && (
        <Text style={styles.error}>{errors.tempPassword.message}</Text>
      )}

      <Controller
        control={control}
        name='newPassword'
        render={({ field: { onChange, value } }) => (
          <TextInput
            label='New Password'
            value={value}
            onChangeText={onChange}
            secureTextEntry
            style={styles.input}
            error={!!errors.newPassword}
          />
        )}
      />
      {errors.newPassword && (
        <Text style={styles.error}>{errors.newPassword.message}</Text>
      )}

      <Button
        mode='contained'
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
        loading={status === 'loading'}
      >
        Change Password
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { marginBottom: 20, textAlign: 'center' },
  input: { marginBottom: 10 },
  forgot: { textAlign: 'right', marginBottom: 20, color: '#007AFF' },
  button: { marginTop: 10 },
  error: { color: 'red', marginBottom: 10, fontSize: 12 },
});
