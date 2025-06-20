import { useActivateEntryMode } from '@/hooks/apis/memberBookings/useActivateEntry';
import { useCancelBooking } from '@/hooks/apis/memberBookings/useCancelBooking';
import { usePayBooking } from '@/hooks/apis/memberBookings/usePayBooking';
import { usePayGuest } from '@/hooks/apis/memberBookings/usePayGuest';
import { useGetClubCourt } from '@/hooks/apis/courts/useGetClubCourts';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AddGuestModal from './AddGuestModal';
import ViewGuestDetails from './ViewGuestDetails';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

type Props = {
  booking: any;
  refetch?: () => void;
};

const BookingCard = ({ booking, refetch }: Props) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [guestModalVisible, setGuestModalVisible] = useState(false);
  const [guestDetailsVisible, setGuestDetailsVisible] = useState(false);
  const clubId = user?.currentActiveClubId ?? '';

  const { data: courts = [], status } = useGetClubCourt({ clubId });

  const [year, month, day] = booking.date;
  const [startHour, startMin] = booking.startTime;
  const [endHour, endMin] = booking.endTime;

  const formattedDate = `${day.toString().padStart(2, '0')}-${month
    .toString()
    .padStart(2, '0')}-${year}`;
  const formattedTime = `${startHour}:${startMin
    .toString()
    .padStart(2, '0')} - ${endHour}:${endMin.toString().padStart(2, '0')}`;

  const courtName = clubId
    ? status === 'success'
      ? courts?.find((court) => court.id === booking.courtId)?.name || 'Unknown Court'
      : 'Loading...'
    : 'No Club';

  const { pay, status: payStatus } = usePayBooking();
  const { cancel, status: cancelStatus } = useCancelBooking();
  const { payGuest, status: payGuestStatus } = usePayGuest();
  const { activateEntryMode, isActivating } = useActivateEntryMode(refetch);

  const guestList = Array.isArray(booking.totalGuestList)
    ? booking.totalGuestList
    : [];

  const isToday = () => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() + 1 === month &&
      today.getDate() === day
    );
  };

  const isBeforeEndTime = () => {
    const now = new Date();
    const endTime = new Date(year, month - 1, day, endHour, endMin);
    return now <= endTime;
  };

  const handlePay = async () => {
    try {
      await pay(booking.id);
      Alert.alert('Payment Success', 'Booking marked as paid');
      refetch?.();
    } catch {
      Alert.alert('Payment Failed', 'Could not update payment status');
    }
  };

  const handleCancel = async () => {
    try {
      await cancel(booking.id);
      Alert.alert('Booking Canceled', 'Booking has been withdrawn');
      refetch?.();
    } catch {
      Alert.alert('Cancellation Failed', 'Could not cancel booking');
    }
  };

  const handlePayGuest = async () => {
    if (payGuestStatus === 'loading') return;

    const result = await payGuest(booking.id);

    if (result.success) {
      Alert.alert('Success', result.message || 'Guest payment successful');
      refetch?.();
    } else {
      Alert.alert('Error', result.message || 'Failed to pay for guests');
    }
  };

  return (
    <View
      style={[
        styles.card,
        booking.activateEntryMode && {
          borderColor: '#4caf50',
          borderWidth: 2,
        },
      ]}
    >
      <Text style={styles.label}>
        <MaterialCommunityIcons name="identifier" size={16} /> Booking ID:{' '}
        <Text style={styles.value}>{booking.id}</Text>
      </Text>

      <Text style={styles.label}>
        <MaterialCommunityIcons name="account-outline" size={16} /> User:{' '}
        <Text style={styles.value}>{booking.userName}</Text>
      </Text>

      <Text style={styles.label}>
        <MaterialCommunityIcons name="calendar" size={16} /> Date:{' '}
        <Text style={styles.value}>{formattedDate}</Text>
      </Text>

      <Text style={styles.label}>
        <MaterialCommunityIcons name="clock-outline" size={16} /> Time:{' '}
        <Text style={styles.value}>{formattedTime}</Text>
      </Text>

      <Text style={styles.label}>
        <MaterialCommunityIcons name="check-decagram-outline" size={16} /> Status:{' '}
        <Text style={styles.value}>{booking.status}</Text>
      </Text>

      <Text style={styles.label}>
        <MaterialCommunityIcons name="tennis" size={16} /> Court Name:{' '}
        <Text style={styles.value}>{courtName}</Text>
      </Text>

      <Text style={styles.label}>
        <MaterialCommunityIcons name="credit-card-outline" size={16} /> Paid:{' '}
        <Text style={styles.value}>{booking.paid ? 'Yes' : 'No'}</Text>
      </Text>

      <Text style={styles.label}>
        <MaterialCommunityIcons name="account-cash-outline" size={16} /> Guests Paid:{' '}
        <Text style={styles.value}>{booking.guestsPaid ? 'Yes' : 'No'}</Text>
      </Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.buttonHalf,
            { backgroundColor: booking.paid ? '#9e9e9e' : '#4caf50' },
          ]}
          onPress={handlePay}
          disabled={booking.paid || payStatus === 'loading'}
        >
          <Text style={styles.buttonText}>
            {booking.paid
              ? 'Paid'
              : payStatus === 'loading'
              ? 'Paying...'
              : 'Pay'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonHalf, { backgroundColor: '#f44336' }]}
          onPress={handleCancel}
          disabled={cancelStatus === 'loading'}
        >
          <Text style={styles.buttonText}>
            {cancelStatus === 'loading' ? 'Withdrawing...' : 'Withdraw'}
          </Text>
        </TouchableOpacity>
      </View>

      {isToday() && isBeforeEndTime() && (
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: booking.activateEntryMode
                ? '#4caf50'
                : isActivating
                ? '#9e9e9e'
                : '#009688',
            },
          ]}
          onPress={() => activateEntryMode({ bookingId: booking.id })}
          disabled={booking.activateEntryMode || isActivating}
        >
          <Text style={styles.buttonText}>
            {booking.activateEntryMode
              ? 'Entry Mode Active'
              : isActivating
              ? 'Activating...'
              : 'Activate Entry Mode'}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#2196f3' }]}
        onPress={() => setGuestModalVisible(true)}
      >
        <Text style={styles.buttonText}>Add Guest</Text>
      </TouchableOpacity>

      {guestList.length > 0 && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#673ab7' }]}
          onPress={() => setGuestDetailsVisible(true)}
        >
          <Text style={styles.buttonText}>View Guest Details</Text>
        </TouchableOpacity>
      )}

      <AddGuestModal
        visible={guestModalVisible}
        onDismiss={() => setGuestModalVisible(false)}
        bookingId={booking.id}
        whoseGuest={booking.userName}
        onSuccess={refetch ?? (() => {})}
      />

      <ViewGuestDetails
        visible={guestDetailsVisible}
        onDismiss={() => setGuestDetailsVisible(false)}
        guestList={guestList}
        guestsPaid={booking.guestsPaid}
        onPayGuests={handlePayGuest}
        payGuestStatus={payGuestStatus}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    elevation: 2,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  value: {
    fontWeight: 'normal',
  },
  button: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonHalf: {
    flex: 1,
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default BookingCard;
