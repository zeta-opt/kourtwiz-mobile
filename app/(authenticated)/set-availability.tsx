import AvailabilityCalendar from '@/components/set-availability/AvailabilityCalendar';
import { useGetPlayerSchedule } from '@/hooks/apis/set-availability/useGetPlayerSchedule';
import { RootState } from '@/store';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

const SetAvailabilityPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.userId;

  const { refetch } = useGetPlayerSchedule(userId);

  return (
    <View style={styles.container}>
      <AvailabilityCalendar refetch={refetch} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SetAvailabilityPage;
