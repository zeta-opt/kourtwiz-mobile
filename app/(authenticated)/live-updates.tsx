import React from "react";
import { View, StyleSheet } from "react-native";
import LiveUpdatesDashboardCards from "@/components/live-updates/LiveUpdatesDashboardCards";

const LiveUpdatesDashboardPage = () => {
  const setBookings = (bookings: any[]) => {
  };

  return (
    <View style={styles.container}>
      <LiveUpdatesDashboardCards setBookings={setBookings} />
    </View>
  );
};

export default LiveUpdatesDashboardPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // Optional subtle background
    padding: 12,
  },
});
