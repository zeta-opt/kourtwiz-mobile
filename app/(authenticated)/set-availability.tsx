import AvailabilityCalendar from '@/components/set-availability/AvailabilityCalendar';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
 
const SetAvailabilityPage = () => {
    const { data } = useLocalSearchParams();
    console.log("whole data", data)
  
      const formatDateToLocalISOString = (date: Date) => {
      const pad = (num: number) => String(num).padStart(2, '0');
  
      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      const seconds = pad(date.getSeconds());
  
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000`;
    };
  
    const parsedData = data ? JSON.parse(decodeURIComponent(data as string)) : null;
    const parseDateArray = (arr: number[] | string) => {
    if (!Array.isArray(arr)) return new Date(arr); // already a date string/ISO
    const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = arr;
    return new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1e6));
  };
  
  const parsedSchedule = parsedData?.unavailableEntries?.map((entry: any) => ({
    sessionId: entry.sessionId,
    title: entry.title,
    reason: entry.reason,
    startTime: formatDateToLocalISOString(parseDateArray(entry.startTime)),
    endTime: formatDateToLocalISOString(parseDateArray(entry.endTime)),
  })) ?? [];
  console.log("schedule data",parsedSchedule)

  return (
    <View style={styles.container}>
      <AvailabilityCalendar schedule={parsedSchedule} />
    </View>
  );
};
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
 
export default SetAvailabilityPage;