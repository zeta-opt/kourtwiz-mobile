import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { router } from "expo-router";
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text } from "react-native-paper";

const bgImage = require("../assets/images/kourtwiz_login_bg.png");
const logoImage = require("../assets/images/kourtwiz_logo_new.png");

export default function WelcomeScreen() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("✅ Already authenticated. Redirecting to home...");
      router.replace("/(authenticated)/home");
    }
  }, [isAuthenticated]);

  return (
    <ImageBackground
      source={bgImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome to Kourtwiz</Text>

          <Button
            mode="contained"
            onPress={() => router.push("/login")}
            style={styles.loginButton}
            labelStyle={styles.loginLabel}
          >
            Login
          </Button>

          <Button
            mode="outlined"
            onPress={() => router.push("/newsignup")}
            style={styles.signupButton}
            labelStyle={styles.signupLabel}
          >
            Signup
          </Button>
        </View>
      </View>
      <Image source={logoImage} style={styles.logo} resizeMode="contain" />
    </ImageBackground>
  );
}
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 30,
    borderRadius: 20,
    width: width - 48,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#002366",
  },
  loginButton: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#5E3ADB",
    marginBottom: 16,
  },
  loginLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  signupButton: {
    width: "100%",
    borderRadius: 12,
    borderColor: "#5E3ADB",
    borderWidth: 1.5,
  },
  signupLabel: {
    fontSize: 16,
    color: "#5E3ADB",
    fontWeight: "600",
  },
  logo: {
    height: 50,
    width: 160,
    alignSelf: "center",
  },
});