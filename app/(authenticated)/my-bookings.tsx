import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useGetMyBookings } from '@/hooks/apis/memberBookings/useGetMyBookings';
import { useGetClubCourt } from '@/hooks/apis/courts/useGetClubCourts';
import BookingsCard from '@/components/MyBookings/BookingsCard';

export default function MyBookings() {
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId || '';
  const clubId = user?.currentActiveClubId || '';

  const { data, status, refetch } = useGetMyBookings({ userId });
  const {
    data: courts = [],
    status: courtStatus,
    refetch: refetchCourts,
  } = useGetClubCourt({ clubId });
  console.log(data);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>My Bookings</Text>
      {data?.map((booking) => (
        <BookingsCard
          key={booking.id}
          booking={booking}
          status={courtStatus}
          courts={courts ?? []}
          refetch={refetch}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    marginBottom: 12,
    fontWeight: 'bold',
  },
});
