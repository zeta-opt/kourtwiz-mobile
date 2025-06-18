import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";

export type UserPreviousBooking = {
    id: string;
    coachId: string;
    coachName: string;
    date: string;
    start: string; // ISO format
    end: string;   // ISO format
    refetch: () => void;
};

const PreviousCoachBookingCard = ({ coachName, date, start, end }: UserPreviousBooking) => {
  const formatTime = (isoString: string) => {
    const time = new Date(isoString);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <Text><Text style={styles.label}>Coach Name:</Text> {coachName}</Text>
        <Text><Text style={styles.label}>Date:</Text> {date}</Text>
        <Text><Text style={styles.label}>Start Time:</Text> {formatTime(start)}</Text>
        <Text><Text style={styles.label}>End Time:</Text> {formatTime(end)}</Text>
      </View>
    </Card>
  );
};

export default PreviousCoachBookingCard;

const styles = StyleSheet.create({
  card: {
    margin: 12,
  },
  cardContent: {
    margin: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  label: {
    fontWeight: "700",
  },
});