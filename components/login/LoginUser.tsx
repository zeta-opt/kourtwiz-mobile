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
  const handleSuccess = async (resData: any) => {
    await storeToken(resData.token);
    router.push('/(authenticated)/home');
  };
  const handleError = () => {
    console.log('login failed');
  };
  //     const handleLogin = async (e: React.FormEvent) => {
  //     e.preventDefault();
  //     setLoading(true);
  //     setError(null);

  //     try {
  //       const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  //       const response = await fetch(`${BASE_URL}/auth/login`, {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify(credentials),
  //       });

  //       if (!response.ok) throw new Error('Invalid username or password');

  //       const data = await response.json();
  //       setToken(data.token);
  //       setIsFirstTimeLogin(data.isFirstTimeLogin);

  //       if (!data.isFirstTimeLogin) {
  //         localStorage.setItem('jwtToken', data.token);
  //         const userData = await fetchUserData(data.token);
  //         const role = userData?.userClubRole?.find(
  //           (club) => club?.clubId === userData?.currentActiveClubId
  //         ).roleName;
  //         console.log('role name : ', role);
  //         if (role === 'Member') {
  //           navigate('/bookings');
  //         } else if (role === 'ClubAdmin') {
  //           navigate('/settings-themes');
  //         } else {
  //           navigate('/bookings');
  //         }
  //       }
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  const onSubmit = async (data: LoginFormData) => {
    const res = await login(data, {
      onSuccess: handleSuccess,
      onError: handleError,
    });
    console.log('response : ', res);
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
        loading={status === 'loading'}
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
