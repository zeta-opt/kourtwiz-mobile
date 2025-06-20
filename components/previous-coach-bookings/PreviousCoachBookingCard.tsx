import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import { useGetClubCoach } from "@/hooks/apis/coach/useGetClubCoach";
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type UserPreviousBooking = {
    id: string;
    clubId: string; 
    coachId: string;
    date: [number, number, number];
    startTime: [number, number];
    endTime: [number, number];
    refetch: () => void;
};

const PreviousCoachBookingCard = ({
  coachId,
  date,
  startTime,
  endTime,
  clubId,
}: UserPreviousBooking) => {
  const { data: coaches } = useGetClubCoach({ clubId });

  const coachName = useMemo(() => {
    if (!coaches) return "Loading...";
    const coach = coaches.find((c) => c.id === coachId);
    return coach?.name ?? "Coach not found";
  }, [coaches, coachId]);

  const formatTime = (time: [number, number]) => {
    const [hour, minute] = time;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };

  const formatDate = (date: [number, number, number]) => {
    const [year, month, day] = date;
    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
  };

  return (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
      <Text style={styles.row}>
        <MaterialCommunityIcons name="account-tie-outline" size={16} color="#333" />{" "}
          <Text style={styles.label}>Coach:</Text>{" "}
          {coachName === "Coach not found" ? (
            <Text style={styles.warningText}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color="darkred" />{" "}
              Coach not found
            </Text>
          ) : (
            <Text style={styles.normalText}>{coachName}</Text>
          )}
        </Text>
  
        <Text style={styles.row}>
          <MaterialCommunityIcons name="calendar" size={16} color="#333" />{" "}
          <Text style={styles.label}>Date:</Text>{" "}
          <Text style={styles.normalText}>{formatDate(date)}</Text>
        </Text>
  
        <Text style={styles.row}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#333" />{" "}
          <Text style={styles.label}>Time:</Text>{" "}
          <Text style={styles.normalText}>
            {formatTime(startTime)} - {formatTime(endTime)}
          </Text>
        </Text>
      </View>
    </Card>
  );
};

export default PreviousCoachBookingCard;


const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 12,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB", // light border
    elevation: 4,
  },
  cardContent: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    marginBottom: 8,
  },
  label: {
    fontWeight: "700",
    color: "#000",
  },
  icon: {
    color: "#4B5563", // icon color
    fontSize: 16,
    marginRight: 4,
  },
  normalText: {
    color: "#000",
  },
  warningText: {
    color: 'darkred', // warning red
    fontWeight: "600",
  },
});
