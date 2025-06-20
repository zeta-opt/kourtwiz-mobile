import { useGetClubCoach } from '@/hooks/apis/coach/useGetClubCoach';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

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
    if (!coaches) return 'Loading...';
    const coach = coaches.find((c) => c.id === coachId);
    return coach?.name ?? 'Coach not found';
  }, [coaches, coachId]);

  const formatTime = (time: [number, number]) => {
    const [hour, minute] = time;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(
      2,
      '0'
    )}`;
  };

  const formatDate = (date: [number, number, number]) => {
    const [year, month, day] = date;
    return `${String(day).padStart(2, '0')}/${String(month).padStart(
      2,
      '0'
    )}/${year}`;
  };

  return (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <Text>
          <MaterialCommunityIcons name='account' size={16} />{' '}
          <Text style={styles.label}>Coach Name:</Text> {coachName}
        </Text>

        <Text>
          <MaterialCommunityIcons name='calendar' size={16} />{' '}
          <Text style={styles.label}>Date:</Text> {formatDate(date)}
        </Text>

        <Text>
          <MaterialCommunityIcons name='clock-outline' size={16} />{' '}
          <Text style={styles.label}>Start Time:</Text> {formatTime(startTime)}
        </Text>

        <Text>
          <MaterialCommunityIcons name='clock-end' size={16} />{' '}
          <Text style={styles.label}>End Time:</Text> {formatTime(endTime)}
        </Text>
      </View>
    </Card>
  );
};

export default PreviousCoachBookingCard;

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
