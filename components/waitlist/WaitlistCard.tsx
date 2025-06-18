import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";

export type WaitlistCardProps = {
  id: string;
  playType: string;
  courtName: string;
  startTime: number[]; // [year, month, day, hour, minute]
  durationMinutes: number;
  skillLevel: string;
  refetch: () => void;
};

const WaitlistCard = ({
  courtName,
  startTime,
  durationMinutes,
  skillLevel,
}: WaitlistCardProps) => {
  const [year, month, day, hour, minute] = startTime;
  const formattedDate = `${day}/${month}/${year}`;
  const formattedTime = `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;

    return (
      <Card style={styles.card}>
        <View style={styles.cardContent}>
          <Text><Text style={styles.label}>Court:</Text> {courtName}</Text>
          <Text><Text style={styles.label}>Date:</Text> {formattedDate}</Text>
          <Text><Text style={styles.label}>Time:</Text> {formattedTime}</Text>
          <Text><Text style={styles.label}>Duration:</Text> {durationMinutes} min</Text>
          <Text><Text style={styles.label}>Skill Level:</Text> {skillLevel}</Text>
        </View>
      </Card>
    );
  };

export default WaitlistCard;

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
