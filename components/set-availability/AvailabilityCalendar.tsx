import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Text,
  Modal,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { Calendar as BigCalendar } from "react-native-big-calendar";
import { parseISO, isWithinInterval, isSameDay, format } from "date-fns";

import UserAvatar from "@/assets/UserAvatar";
import { Ionicons } from "@expo/vector-icons";

import SetAvailabilityForm from "./SetAvailabilityForm";
import { useGetPlayerSchedule } from "@/hooks/apis/set-availability/useGetPlayerSchedule";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { router } from "expo-router";

type ScheduleEvent = {
  sessionId: string;
  title: string | null;
  reason: string;
  startTime: string | number;
  endTime: string | number;
};

type Props = {
  refetch: () => Promise<void>;
};

export default function AvailabilityCalendar({ refetch }: Props) {
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.userId;

  const { data: scheduleData } = useGetPlayerSchedule(userId);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

  // Helpers
  const formatDateToLocalISOString = (date: Date) => {
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}.000`;
  };

  const parseDateArray = (arr: number[] | string) => {
    if (!Array.isArray(arr)) return new Date(arr);
    const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = arr;
    return new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
      Math.floor(nano / 1e6)
    );
  };

  // Parse scheduleData safely
  const parsedData = useMemo(() => {
    if (!scheduleData) return null;
    if (typeof scheduleData === "string") {
      try {
        return JSON.parse(decodeURIComponent(scheduleData));
      } catch (err) {
        console.error("Failed to parse scheduleData:", err, scheduleData);
        return null;
      }
    }
    return scheduleData;
  }, [scheduleData]);

  const parsedSchedule: ScheduleEvent[] =
    parsedData?.unavailableEntries?.map((entry: any) => ({
      sessionId: entry.sessionId,
      title: entry.title,
      reason: entry.reason,
      startTime: formatDateToLocalISOString(parseDateArray(entry.startTime)),
      endTime: formatDateToLocalISOString(parseDateArray(entry.endTime)),
    })) ?? [];
    console.log(parsedSchedule)
  // Sanitize
  const sanitizedSchedule: ScheduleEvent[] = useMemo(() => {
    return parsedSchedule.map((e) => {
      const start =
        typeof e.startTime === "string"
          ? parseISO(e.startTime)
          : new Date(e.startTime);
      const end =
        typeof e.endTime === "string"
          ? parseISO(e.endTime)
          : new Date(e.endTime);

      return {
        ...e,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        title: e.title || "Unavailable",
      };
    });
  }, [parsedSchedule]);

  // Filter by selected date
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

  const events = filteredEvents.map((e) => ({
    title: e.reason,
    start: parseISO(e.startTime),
    end: parseISO(e.endTime),
    color: "#FF6B6B",
    sessionId: e.sessionId,
    reason: e.reason,
  }));

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    sanitizedSchedule.forEach((e) => {
      const dateStr = format(parseISO(e.startTime), "yyyy-MM-dd");
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
        onDayPress={(day: DateData) =>
          setSelectedDate(new Date(day.dateString))
        }
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
            title: event.title || "Unavailable",
            reason: event.reason,
            startTime: event.start.toISOString(),
            endTime: event.end.toISOString(),
          });
          setShowForm(true);
        }}
        onPressCell={(date) => {
          setEditingEvent({
            sessionId: "",
            title: "",
            reason: "",
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
            await refetch();
          }}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF6F5",
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#2F7C83",
  },
  backButton: {
    paddingRight: 10,
    paddingVertical: 5,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
