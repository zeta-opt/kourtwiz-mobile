import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useGetClubBookings } from "@/hooks/apis/club-bookings/useGetClubBookings";
import { useGetClubCourt } from "@/hooks/apis/courts/useGetClubCourts";
import LoaderScreen from "@/shared/components/Loader/LoaderScreen";
import ClubBookingCard from "@/components/club-booking/ClubBookingCard";

const ClubSchedulePage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const clubId = user?.userClubRole?.[0]?.clubId ?? "";

  const { data: bookings, status: bookingStatus } = useGetClubBookings(clubId);
  const { data: courts, status: courtsStatus } = useGetClubCourt({ clubId });

  if (bookingStatus === "loading" || courtsStatus === "loading") {
    return <LoaderScreen />;
  }

  if (bookingStatus === "error" || courtsStatus === "error") {
    return <Text style={styles.error}>Error loading data.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Club Bookings</Text>
      {bookings && bookings.length > 0 ? (
        bookings.map((booking: any) => {
          const courtName = courts?.find(c => c.id === booking.courtId)?.name ?? "N/A";
          return <ClubBookingCard key={booking.id} {...booking} courtName={courtName} />;
        })
      ) : (
        <Text>No bookings available.</Text>
      )}
    </ScrollView>
  );
};

export default ClubSchedulePage;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 16,
  },
  error: {
    color: "red",
    padding: 16,
  },
});
