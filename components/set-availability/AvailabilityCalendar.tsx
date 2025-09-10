import React, { useState, useMemo } from "react";
import { View, Alert,  StyleSheet, TouchableOpacity,SafeAreaView, Text, Modal } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { Calendar as BigCalendar } from "react-native-big-calendar";
import { parseISO, formatISO, isWithinInterval, isSameDay } from "date-fns";

import UserAvatar from "@/assets/UserAvatar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import SetAvailabilityForm from "./SetAvailabilityForm";

type ScheduleEvent = {
  sessionId: string;
  title: string | null;
  reason: string;
  startTime: string | number;
  endTime: string | number;
};

type Props = {
  schedule: ScheduleEvent[];
  refetch: () => Promise<void>;
};
export default function AvailabilityCalendar({ schedule, refetch }: Props) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);


  // Sanitize schedule data
  const sanitizedSchedule: ScheduleEvent[] = useMemo(() => {
    return (schedule ?? []).map((e) => {
      let start: Date;
      let end: Date;

      if (typeof e.startTime === "string") start = parseISO(e.startTime);
      else if (typeof e.startTime === "number")
        start = new Date(e.startTime, 0, 1, 9, 0);
      else start = new Date();

      if (typeof e.endTime === "string") end = parseISO(e.endTime);
      else if (typeof e.endTime === "number")
        end = new Date(e.endTime, 0, 1, 17, 0);
      else end = new Date(start.getTime() + 60 * 60 * 1000);

      return {
        ...e,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        title: e.title || "Unavailable",
      };
    });
  }, [schedule]);

  // Filter events for selected day
  const filteredEvents = useMemo(() => {
    return sanitizedSchedule.filter((e) => {
      const start = parseISO(e.startTime);
      const end = parseISO(e.endTime);
      return (
        isWithinInterval(selectedDate, { start, end }) ||
        isSameDay(start, selectedDate)
      );
    });
  }, [sanitizedSchedule, selectedDate]);

  const events = useMemo(
    () =>
      filteredEvents.map((e) => ({
        title: e.reason,
        start: parseISO(e.startTime),
        end: parseISO(e.endTime),
        color: "#FF6B6B",
        sessionId: e.sessionId,
        reason: e.reason,
      })),
    [filteredEvents]
  );

  const handlePressEvent = (event: any) => {
    Alert.alert(
      "Unavailable",
      `Reason: ${event.reason}\nFrom: ${event.start.toLocaleString()}\nTo: ${event.end.toLocaleString()}`
    );
  };

  // Highlight dates with events
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    sanitizedSchedule.forEach((e) => {
      const dateStr = parseISO(e.startTime).toISOString().split("T")[0];
      marks[dateStr] = { marked: true, dotColor: "#FF6B6B" };
    });
    return marks;
  }, [sanitizedSchedule]);

  return (
     <SafeAreaView>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/(authenticated)/home")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#cce5e3" />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Set Availability</Text>
        </View>

        <UserAvatar size={30} />
      </View>

      {/* Month Calendar Picker */}
      <Calendar
        onDayPress={(day: DateData) => setSelectedDate(new Date(day.dateString))}
        markedDates={markedDates}
        enableSwipeMonths={true}
      />

      {/* Day View Calendar */}
      <BigCalendar
  events={events}
  height={600}
  mode="day"
  date={selectedDate}
  onPressEvent={(event) => {
    setEditingEvent({
      sessionId: event.sessionId,
      title: event.title || 'Unavailable',
      reason: event.reason,
      startTime: event.start.toISOString(),
      endTime: event.end.toISOString(),
    });
    setShowForm(true);
  }}
  onPressCell={(date) => {
    // empty slot
    setEditingEvent({
      sessionId: '',
      title: '',
      reason: '',
      startTime: date.toISOString(),
      endTime: date.toISOString(),
    });
    setShowForm(true);
  }}
/>
<Modal visible={showForm} animationType="slide">
<SetAvailabilityForm
  event={editingEvent}
  onClose={() => setShowForm(false)}
   onSave={async () => {
            setShowForm(false);
            await refetch(); // 👈 refresh after save
          }}
/>
</Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
   container: {
    flex: 1,
    backgroundColor: '#EAF6F5',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#2F7C83',
  },
  backButton: {
    paddingRight: 10,
    paddingVertical: 5,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});