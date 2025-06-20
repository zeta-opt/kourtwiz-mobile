import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useGetPreviousCoachBookings } from "@/hooks/apis/bookings/useGetUsersPreviousCoachBookings";
import PreviousCoachBookingCard from "@/components/previous-coach-bookings/PreviousCoachBookingCard";
import LoaderScreen from "@/shared/components/Loader/LoaderScreen";

const PreviousCoachBookingsPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.userId ?? "";

  const { data: bookings, status, refetch } = useGetPreviousCoachBookings(userId);

  if (status === "loading") return <LoaderScreen />;
  if (status === "error") return <Text style={styles.error}>Error loading coach bookings.</Text>;
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Previous Coach Bookings</Text>

      {bookings && bookings.length > 0 ? (
        bookings.map((booking: any) => (
          <PreviousCoachBookingCard 
          key={booking.id} {...booking} 
          refetch={refetch}
          clubId={booking.clubId}
          />
        ))
      ) : (
        <Text style={styles.noData}>No previous coach bookings found.</Text>
      )}
    </ScrollView>
  );
};

export default PreviousCoachBookingsPage;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  noData: {
    fontStyle: "italic",
    marginTop: 20,
  },
  error: {
    color: "red",
    padding: 16,
  },
});
