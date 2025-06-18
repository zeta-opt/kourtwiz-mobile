import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";

type ClubBookingCardProps = {
  courtName: string;
  date: [number, number, number],
  startTime: [number, number];
  endTime: [number, number];
  participants: any[];
  status: string;
};

const ClubBookingCard = ({
  courtName,
  date,
  startTime,
  endTime,
  participants,
  status,
}: ClubBookingCardProps) => {
  const formatTime = (time: [number, number]) => {
    const [hour, minute] = time;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };
  const formatDate = (date: [number, number, number]) => {
    const [year, month, day] = date;
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  };

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <Text><Text style={styles.label}>Court:</Text> {courtName}</Text>
        <Text><Text style={styles.label}>Date:</Text> {formatDate(date)}</Text>
        <Text><Text style={styles.label}>Start Time:</Text> {formatTime(startTime)}</Text>
        <Text><Text style={styles.label}>End Time:</Text> {formatTime(endTime)}</Text>
        <Text><Text style={styles.label}>Participants:</Text> {participants.length}</Text>
        <Text><Text style={styles.label}>Status:</Text> {status}</Text>
      </View>
    </Card>
  );
};


export default ClubBookingCard;

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    marginHorizontal: 16,
  },
  content: {
    padding: 16,
  },
  label: {
    fontWeight: "bold",
  },
});
