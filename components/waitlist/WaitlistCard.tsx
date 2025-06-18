import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

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
    <View style={styles.card}>
      <Text variant="titleMedium">{courtName}</Text>
      <Text>Date: {formattedDate}</Text>
      <Text>Time: {formattedTime}</Text>
      <Text>Duration: {durationMinutes} min</Text>
      <Text>Skill Level: {skillLevel}</Text>
    </View>
  );
};

export default WaitlistCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
