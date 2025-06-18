import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { useCancelBooking } from '@/hooks/apis/bookings/useCancelBooking';
import { memo } from 'react';

export type Booking = {
  id: string;
  bookingId: string;
  playTypeName: string;
  courtName: string;
  durationMinutes: number;
  skillLevel: string;
  maxPlayers: number;
  registeredPlayers?: any[];
};

type Props = {
  userId: string;
  bookings: Booking[];
  status: 'loading' | 'error' | 'success';
  refetch: () => void;
};

function OpenPlayBookingCards({ userId, bookings, status, refetch }: Props) {
  const { cancelBooking, isCanceling } = useCancelBooking();

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Confirm Cancellation',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No' },
        {
          text: 'Yes',
          onPress: () =>
            cancelBooking(
              { bookingId, userId },
              {
                onSuccess: () => {
                  refetch();
                },
                onError: (err) => {
                  Alert.alert('Error', err.message);
                },
              }
            ),
        },
      ]
    );
  };

  return (
    <ScrollView>
      <Text style={styles.heading}>Your Play Bookings</Text>

      {status === 'loading' ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : status === 'error' ? (
        <Text style={styles.error}>Error loading bookings.</Text>
      ) : bookings.length > 0 ? (
        bookings?.map((booking, index) => (
          <Card key={booking.bookingId || index} style={styles.card}>
            <View style={styles.cardContent}>
                <Text><Text style={styles.label}>Play Type:</Text> {booking.playTypeName}</Text>
                <Text><Text style={styles.label}>Court:</Text> {booking.courtName}</Text>
                <Text><Text style={styles.label}>Duration:</Text> {booking.durationMinutes} minutes</Text>
                <Text><Text style={styles.label}>Skill Level:</Text> {booking.skillLevel}</Text>
                <Text><Text style={styles.label}>Max Players:</Text> {booking.maxPlayers}</Text>
                <Text><Text style={styles.label}>Slots Filled:</Text> {booking.registeredPlayers?.length ?? 0}</Text>
            </View>
            <Button
              onPress={() => handleCancelBooking(booking.bookingId)}
              loading={isCanceling}
              style={styles.cancelButton}
              mode="contained"
              disabled={isCanceling}
            >
              {isCanceling ? 'Canceling...' : 'Cancel'}
            </Button>
          </Card>
        ))
      ) : (
        <Text style={styles.message}>No bookings found.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heading: {
    textAlign: 'center',
    fontSize: 20,
    marginVertical: 20,
    fontWeight: 'bold',
  },
  card: {
    margin: 12,
  },
  cardContent: {
    margin: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  label: {
    fontWeight: '700',
  },
  message: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
  error: {
    textAlign: 'center',
    marginVertical: 10,
  },
  cancelButton: {
    margin: 12,
  },
});

export default memo(OpenPlayBookingCards);
