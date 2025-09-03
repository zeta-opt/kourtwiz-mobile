import React, { useState, useEffect } from "react";
import { View, Text, Switch, Alert, StyleSheet, ActivityIndicator } from "react-native";
import Constants from "expo-constants";

type Props = {
  userId: string;
  initialSubscribed?: boolean;
  onSubscriptionChange?: (subscribed: boolean) => void;
};

const VideoSubscriptionToggle: React.FC<Props> = ({
  userId,
  initialSubscribed = false,
  onSubscriptionChange,
}) => {
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
  const [loading, setLoading] = useState(false);
  const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

  useEffect(() => {
    setIsSubscribed(initialSubscribed ?? false);
  }, [initialSubscribed]);

  const updateSubscription = async (subscribed: boolean) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${BASE_URL}/users/${userId}/video-subscription?subscribed=${subscribed}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) throw new Error("Failed to update subscription");

      setIsSubscribed(subscribed);
      onSubscriptionChange?.(subscribed);

      if (subscribed) {
        Alert.alert("Subscribed", "Subscribed for videos");
      }
    } catch (err) {
      console.error("❌ Video subscription error:", err);
      Alert.alert("Error", "Failed to update subscription. Please try again.");
      setIsSubscribed(!subscribed);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (value: boolean) => {
    if (!value) {
      Alert.alert("Unsubscribe", "Are you sure you want to unsubscribe?", [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", style: "destructive", onPress: () => updateSubscription(false) },
      ]);
    } else {
      updateSubscription(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Video Subscription</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#2F7C83" />
      ) : (
        <Switch
          value={isSubscribed}
          onValueChange={handleToggle}
          thumbColor={isSubscribed ? "#2F7C83" : "#ccc"}
          trackColor={{ false: "#ddd", true: "#87B9BC" }}
        />
      )}
    </View>
  );
};

export default VideoSubscriptionToggle;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});
