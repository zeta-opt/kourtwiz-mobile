import { useFetchUser } from '@/hooks/apis/authentication/useFetchUser';
import { useLoginUser } from '@/hooks/apis/authentication/useLoginUser';
import { storeToken } from '@/shared/helpers/storeToken';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { z } from 'zod';
// Schema definition using Zod
const loginSchema = z.object({
  username: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginUser() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const { login, status } = useLoginUser();
  const { fetchUser, status: userFetchStatus } = useFetchUser();

  const handleSuccess = async (resData: any) => {
    await storeToken(resData.token);
    router.push('/(authenticated)/home');
  };

  const handleError = () => {
    console.log('login failed');
  };

  const onSubmit = async (data: LoginFormData) => {
    await login(data, {
      onSuccess: handleSuccess,
      onError: handleError,
    });
    //setting /me data
    await fetchUser();
  };

  return (
    <View style={styles.container}>
      <Text variant='headlineMedium' style={styles.title}>
        Login
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
        name='password'
        render={({ field: { onChange, value } }) => (
          <TextInput
            label='Password'
            value={value}
            onChangeText={onChange}
            secureTextEntry
            style={styles.input}
            error={!!errors.password}
          />
        )}
      />
      {errors.password && (
        <Text style={styles.error}>{errors.password.message}</Text>
      )}

      <TouchableOpacity onPress={() => console.log('Forgot Password?')}>
        <Text style={styles.forgot}>Forgot Password?</Text>
      </TouchableOpacity>

      <Button
        mode='contained'
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
        loading={status === 'loading' || userFetchStatus === 'loading'}
      >
        Login
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
