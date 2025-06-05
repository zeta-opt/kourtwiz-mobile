import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { z } from "zod";

// Schema definition using Zod
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  tempPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  newPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginFirstTime() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    router.push("/(authenticated)/home");
  };
  console.log("in login first time user tsx");
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Login First Time
      </Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Email"
            value={value}
            onChangeText={onChange}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            error={!!errors.email}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="tempPassword"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Old Password"
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
        name="newPassword"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="New Password"
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
      <TouchableOpacity onPress={() => console.log("Forgot Password?")}>
        <Text style={styles.forgot}>Forgot Password?</Text>
      </TouchableOpacity>

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
      >
        Login
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { marginBottom: 20, textAlign: "center" },
  input: { marginBottom: 10 },
  forgot: { textAlign: "right", marginBottom: 20, color: "#007AFF" },
  button: { marginTop: 10 },
  error: { color: "red", marginBottom: 10, fontSize: 12 },
});
