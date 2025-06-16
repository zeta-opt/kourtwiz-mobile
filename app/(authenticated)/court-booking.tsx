import {
  fetchBookings,
  fetchCourts,
} from "@/components/court-timeline/api/getBookingsAPI";
import CourtTimeline from "@/components/court-timeline/CourtTimeline";
import { format, setHours, setMinutes } from "date-fns";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useSelector } from "react-redux";

const SLOT_SIZES = [15, 30, 60];


const CourtBookingScreen = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date(Date.now()));
  const [slotSize, setSlotSize] = useState(30);
  const [courts, setCourts] = useState<{ id: string; title: string }[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const formattedDate = format(selectedDate, "yyyy-MM-dd");

  const formatTimeArray = ([hour, minute]: number[]): string => {
    const time = setMinutes(setHours(new Date(), hour), minute);
    return format(time, 'hh:mm a');
  };
  const user = useSelector((state: any) => state.auth.user);
  const USER_ID = user?.userId;
  const CLUB_ID = user?.currentActiveClubId;
  const loadData = async () => {
    try {
      setLoading(true);
      const [courtsData, bookingsRes] = await Promise.all([
        fetchCourts(CLUB_ID),
        fetchBookings(CLUB_ID),
      ]);
      console.log("booking res", bookingsRes)
      setBookings(bookingsRes);
      setCourts(courtsData);
    } catch (err) {
      console.error("Error loading courts/bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate, refreshFlag]);

  const getBookedSlots = (courtId: string) => {
  return bookings
    .filter((b) => {
      if (!b.date || !Array.isArray(b.date)) return false;
      return (
        b.courtId === courtId &&
        b.date[0] === selectedDate.getFullYear() &&
        b.date[1] === selectedDate.getMonth() + 1 &&
        b.date[2] === selectedDate.getDate()
      );
    })
    .map((b) => formatTimeArray(b.startTime));
};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Court Booking</Text>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Date:</Text>
        <Calendar
          markedDates={{
            [formattedDate]: { selected: true, selectedColor: "#007bff" },
          }}
          onDayPress={(day) => setSelectedDate(new Date(day.dateString))}
          minDate={new Date().toISOString().split("T")[0]}
        />
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Courts</Text>
        {/* <Picker
          selectedValue={slotSize}
          style={styles.picker}
          onValueChange={(value) => setSlotSize(value)}
        >
          {SLOT_SIZES.map((size) => (
            <Picker.Item key={size} label={`${size} mins`} value={size} />
          ))} 
        </Picker>*/}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        courts.map((court) => (
          <CourtTimeline
            key={court.id}
            courtId={court.id}
            courtName={court.title}
            date={selectedDate}
            slotSize={slotSize}
            bookedSlots={getBookedSlots(court.id)}
            userId={USER_ID}
            clubId={CLUB_ID}
            onRefresh={() => setRefreshFlag((prev) => !prev)}
          />
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  pickerContainer: { marginBottom: 20 },
  label: { marginBottom: 6, fontWeight: "600" },
  picker: { height: 40, width: 180 },
});

export default CourtBookingScreen;
