import { useFetchUser } from "@/hooks/apis/authentication/useFetchUser";
import { useLoginUser } from "@/hooks/apis/authentication/useLoginUser";
import { storeToken } from "@/shared/helpers/storeToken";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { z } from "zod";
import React, { useState } from "react";
import ForgotPasswordModal from "@/components/login/ForgotPasswordModal";

// 📄 Zod validation schema
const loginSchema = z.object({
  username: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
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

  const handleSuccess = async (resData: any) => {
    console.log("✅ Login Success. Token:", resData.token);
    await storeToken(resData.token);
    console.log("✅ Token stored");

    try {
      await fetchUser();
      console.log("✅ User fetched successfully");
      router.push("/(authenticated)/home");
    } catch (e) {
      console.error("❌ Failed to fetch user after login", e);
    }
  };

  const handleError = () => {
    console.log("❌ Login failed");
  };

  const onSubmit = async (data: LoginFormData) => {
    await login(data, {
      onSuccess: handleSuccess,
      onError: handleError,
    });
  };

  return (
    <ImageBackground
      source={require("../../assets/images/kourtwiz_login_bg.png")}
      resizeMode="cover"
      style={styles.background}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.card}>
          <Text variant="headlineMedium" style={styles.title}>
            Login
          </Text>

          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Email"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
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
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry={!showPassword}
                style={styles.input}
                error={!!errors.password}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
            )}
          />
          {errors.password && (
            <Text style={styles.error}>{errors.password.message}</Text>
          )}

          <TouchableOpacity onPress={() => setShowForgotPassword(true)}>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
            loading={status === "loading" || userFetchStatus === "loading"}
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
    backgroundColor: "#0365A9",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 24,
    borderRadius: 16,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
    color: "#116AAD",
    fontWeight: "bold",
  },
  input: {
    marginBottom: 10,
  },
  forgot: {
    textAlign: "right",
    marginBottom: 20,
    color: "#007AFF",
  },
  button: {
    marginTop: 10,
  },
  error: {
    color: "red",
    marginBottom: 10,
    fontSize: 12,
  },
});
