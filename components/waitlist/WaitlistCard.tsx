import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

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
  const formattedTime = `${hour.toString().padStart(2, '0')}:${minute
    .toString()
    .padStart(2, '0')}`;

  return (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <Text>
          <MaterialCommunityIcons name='tennis' size={16} />{' '}
          <Text style={styles.label}>Court:</Text> {courtName}
        </Text>

        <Text>
          <MaterialCommunityIcons name='calendar' size={16} />{' '}
          <Text style={styles.label}>Date:</Text> {formattedDate}
        </Text>

        <Text>
          <MaterialCommunityIcons name='clock-outline' size={16} />{' '}
          <Text style={styles.label}>Time:</Text> {formattedTime}
        </Text>

        <Text>
          <MaterialCommunityIcons name='timer-outline' size={16} />{' '}
          <Text style={styles.label}>Duration:</Text> {durationMinutes} min
        </Text>

        <Text>
          <MaterialCommunityIcons name='star-circle-outline' size={16} />{' '}
          <Text style={styles.label}>Skill Level:</Text> {skillLevel}
        </Text>
      </View>
    </Card>
  );
};

export default WaitlistCard;

const styles = StyleSheet.create({
  card: {
    margin: 12,
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  cardContent: {
    margin: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  label: {
    fontWeight: '700',
  },
});
