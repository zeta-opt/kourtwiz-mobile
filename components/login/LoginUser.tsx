import ForgotPasswordModal from '@/components/login/ForgotPasswordModal';
import { useFetchUser } from '@/hooks/apis/authentication/useFetchUser';
import { useLoginUser } from '@/hooks/apis/authentication/useLoginUser';
import { storeToken } from '@/shared/helpers/storeToken';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { z } from 'zod';

// 📄 Zod validation schema - now accepts email or phone number
const loginSchema = z.object({
  username: z.string().refine(
    (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex =
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}$/;

      return (
        emailRegex.test(value) || phoneRegex.test(value.replace(/\s/g, ''))
      );
    },
    { message: 'Please enter a valid email address or phone number' }
  ),
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
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const { login, status } = useLoginUser();
  const { fetchUser, status: userFetchStatus } = useFetchUser();

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSuccess = async (resData: any) => {
    setLoginError(null);
    console.log('✅ Login Success. Token:', resData.token);
    await storeToken(resData.token);
    console.log('✅ Token stored');

    try {
      await fetchUser();
      console.log('✅ User fetched successfully');
      router.replace('/(authenticated)/home');
    } catch (e) {
      console.error('❌ Failed to fetch user after login', e);
    }
  };

  const handleError = (error: Error) => {
    console.log('❌ Login failed', error);

    if (error.message.includes('401')) {
      setLoginError('Invalid email or password.');
    } else {
      setLoginError(error.message || 'Something went wrong. Please try again.');
    }
  };

  const getDeviceToken = async (): Promise<string | null> => {
    try {
      if (Platform.OS === 'ios') {
        return (await Notifications.getDevicePushTokenAsync()).data;
      } else {
        return (await Notifications.getExpoPushTokenAsync()).data;
      }
    } catch (err) {
      console.warn('⚠️ Could not fetch device token:', err);
      return null;
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      const deviceToken = await getDeviceToken();
      console.log(deviceToken, 'Device Token');

      const payload = {
        ...data,
        ...(deviceToken && {
          deviceRegisterRequest: {
            deviceToken,
            platform: Platform.OS,
          },
        }),
      };

      await login(payload, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    } catch (err) {
      console.error('❌ Unexpected error during login', err);
      setLoginError('Something went wrong. Please try again.');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/kourtwiz_login_bg.png')}
      resizeMode='cover'
      style={styles.background}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <Text variant='headlineMedium' style={styles.title}>
            Login
          </Text>

          <Controller
            control={control}
            name='username'
            render={({ field: { onChange, value } }) => (
              <TextInput
                label='Email or Phone Number'
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
                secureTextEntry={!showPassword}
                style={styles.input}
                error={!!errors.password}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
            )}
          />
          {errors.password && (
            <Text style={styles.error}>{errors.password.message}</Text>
          )}

          {/* Login error message */}
          {loginError && (
            <Text style={[styles.error, { textAlign: 'center' }]}>
              {loginError}
            </Text>
          )}

          <TouchableOpacity onPress={() => setShowForgotPassword(true)}>
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
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        visible={showForgotPassword}
        onDismiss={() => setShowForgotPassword(false)}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#0365A9',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 24,
    borderRadius: 16,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#116AAD',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 10,
  },
  forgot: {
    textAlign: 'right',
    marginBottom: 20,
    color: '#007AFF',
  },
  button: {
    marginTop: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    fontSize: 12,
  },
});
