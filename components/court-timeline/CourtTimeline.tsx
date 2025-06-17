import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TimeSlotCard from '../time-slot-card/TimeSlotCard';

interface CourtTimelineProps {
  courtId: string;
  courtName: string;
  bookedSlots: string[];
  date: Date;
  slotSize: number;
  userId: string;
  clubId: string;
  onRefresh: () => void;
}

const CourtTimeline: React.FC<CourtTimelineProps> = ({
  courtId,
  courtName,
  bookedSlots,
  date,
  slotSize,
  userId,
  clubId,
  onRefresh,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const generateSlots = () => {
    const { format, setHours, setMinutes, addMinutes, isBefore } = require('date-fns');
    const slots = [];
    let current = setMinutes(setHours(date, 9), 0);
    const end = setMinutes(setHours(date, 21), 0);

    while (isBefore(current, end)) {
      const timeLabel = format(current, 'hh:mm a');
      slots.push(timeLabel);
      current = addMinutes(current, slotSize);
    }
    return slots;
  };

  const slots = generateSlots();
console.log("booked slots", bookedSlots)
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setIsExpanded(!isExpanded)}>
        <Text style={styles.courtTitle}>{courtName}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={20}
          color="#333"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View>
          {slots.map((slot, index) => (
            <TimeSlotCard
              key={`${courtId}-${slot}-${index}`}
              time={slot}
              court={courtName}
              courtId={courtId}
              isBooked={bookedSlots.includes(slot)}
              date={date}
              userId={userId}
              clubId={clubId}
              onBooked={onRefresh}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 6,
  },
  courtTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CourtTimeline;
