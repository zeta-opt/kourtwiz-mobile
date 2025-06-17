import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { useGetOpenplayBookings } from '@/hooks/apis/bookings/useGetOpenplayBookings';
import OpenPlayBookingCards from '@/components/my-play/OpenPlayBookingsPage';
import { RootState } from '@/store';

export default function MyPlay() {
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId;

  const {
    data: clubBookingData = [],
    status,
    refetch,
  } = useGetOpenplayBookings(userId ?? '');

  console.log('clubBookingData:', clubBookingData);

  return (
    <View style={styles.container}>
      <OpenPlayBookingCards
        userId={userId ?? ''}
        bookings={clubBookingData ?? []}
        status={status}
        refetch={refetch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    paddingBottom: 40,
  },
});
