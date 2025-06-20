import React, { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Card } from "react-native-paper";
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

import { useLiveBookings } from "@/hooks/apis/live-updates/useLiveBookings";
import { useMetaData } from "@/hooks/apis/live-updates/useMetaData";
import sendPaymentReminder from "@/hooks/apis/live-updates/sendPaymentReminder";
import BookingDetailsPopup from "./BookingDetailsPopup";

const isNowPlaying = (date:number[], start:number[], end:number[]) => {
    const now = new Date();
    const startTime = new Date(date[0], date[1] - 1, date[2], start[0], start[1]);
    const endTime = new Date(date[0], date[1] - 1, date[2], end[0], end[1]);
    return now >= startTime && now <= endTime;
  };

interface LiveUpdatesDashboardProps {
  setBookings: (bookings: any[]) => void;
}

const LiveUpdatesDashboardCards: React.FC<LiveUpdatesDashboardProps> = ({ setBookings }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  interface SelectedBookingInfo {
    members: {
      name: string;
      paid: boolean;
    };
    guests: {
      name: string;
      paid: boolean;
    }[];
  }  
  const [selectedBookingInfo, setSelectedBookingInfo] = useState<SelectedBookingInfo | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { user } = useSelector((state: RootState) => state.auth);
  const clubId = user?.userClubRole?.[0]?.clubId ?? "67fe1673f6713e641a18aa1e";

  const { updates, loading: bookingsLoading } = useLiveBookings(clubId);
  const { courtMap, loading: metaLoading } = useMetaData(clubId);

  useEffect(() => {
    if (updates?.length && setBookings) {
      setBookings(updates);
    }
  }, [updates, setBookings]);

  if (!clubId) return <Text style={styles.error}>Invalid club ID</Text>;
  if (bookingsLoading || metaLoading) return <Text style={styles.loading}>Loading...</Text>;

  const currentBookings = updates.filter((booking) =>
    isNowPlaying(booking.date, booking.startTime, booking.endTime)
  );

  const handleRequestToPay = async (bookingId:string) => {
    try {
      await sendPaymentReminder(bookingId);
      alert("Payment request sent.");
    } catch (error) {
      console.error("Error sending payment request:", error);
      alert("Failed to send payment request.");
    }
  };


  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Live Court Updates</Text>
      <Text style={styles.time}>{currentTime.toLocaleString()}</Text>

      {currentBookings.map((booking) => {
        const participants = booking.participants ?? [];
        const guests = booking.totalGuestList ?? [];

        const hasParticipants = participants.length > 0;
        const hasGuests = guests.length > 0;

        let allPaid = false;
        if (hasParticipants && hasGuests) {
          allPaid = booking.paid && booking.guestsPaid;
        } else if (hasParticipants) {
          allPaid = booking.paid;
        } else if (hasGuests) {
          allPaid = booking.guestsPaid;
        }

        const colorStyle = allPaid ? styles.greenCircle : styles.redCircle;

        const membersInfo = {
          name: booking.userName ?? `Member (${booking.userId.slice(0, 4)}…)`,
          paid: booking.paid,
        };

        interface GuestInfo {
            name: string;
            paid: boolean;
        }

        interface Guest {
            id: string;
            name?: string;
        }

        const guestsInfo: GuestInfo[] = guests.map((g: Guest): GuestInfo => ({
            name: g.name ? `${g.name}` : `Guest (${g.id.slice(0, 4)}…)`,
            paid: booking.guestsPaid,
        }));

        const tooltipContent = [
          membersInfo,
          ...guestsInfo.map((g) => ({ name: `${g.name} (Guest)`, paid: g.paid })),
        ];

        return (
          <Card key={booking.id} style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>{courtMap[booking.courtId] || `Court (${booking.courtId.slice(0, 4)}…)`}</Text>

              <TouchableOpacity
                style={styles.playerRow}
                onPress={() => setSelectedBookingInfo({ members: membersInfo, guests: guestsInfo })}
              >
                <View style={[styles.circle, colorStyle]} />
                <View>
                  {tooltipContent.map((p, idx) => (
                    <Text
                      key={idx}
                      style={p.paid ? styles.paidName : styles.unpaidName}
                    >
                      {p.name}
                    </Text>
                  ))}
                </View>
              </TouchableOpacity>

              {allPaid ? (
                <Text style={styles.paidStatus}>All paid</Text>
              ) : (
                <TouchableOpacity onPress={() => handleRequestToPay(booking.id)}>
                  <Text style={styles.requestButton}>Request to Pay</Text>
                </TouchableOpacity>
              )}

              {allPaid ? (
                <Animated.Text style={[styles.lightsOn]}>
                  Lights are ON
                </Animated.Text>
              ) : (
                <Text style={styles.lightsOff}>Lights are OFF</Text>
              )}
            </Card.Content>
          </Card>
        );
      })}

      {Object.entries(courtMap).map(([courtId, courtName]) => {
        const isBooked = currentBookings.some((booking) => booking.courtId === courtId);
        if (isBooked) return null;

        return (
          <Card key={courtId} style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>{courtName}</Text>
              <Text style={styles.noPlayers}>No players</Text>
              <Text style={styles.lightsText}>Lights are OFF</Text>
            </Card.Content>
          </Card>
        );
      })}

      {selectedBookingInfo && (
        <BookingDetailsPopup
          members={selectedBookingInfo.members}
          guests={selectedBookingInfo.guests}
          onClose={() => setSelectedBookingInfo(null)}
          visible={true}
        />
      )}
    </ScrollView>
    </Animated.View>
  );
};

export default LiveUpdatesDashboardCards;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: "#0e1a2b",
    minHeight: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  time: {
    fontSize: 18,
    marginBottom: 20,
    color: "#9cb2ce",
    textAlign: "left",
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#1a2b44",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#dfeaff",
    marginBottom: 10,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#fff",
  },
  greenCircle: {
    backgroundColor: "#00c851",
  },
  redCircle: {
    backgroundColor: "#ff4444",
  },
  paidName: {
    color: "#00e676",
    fontSize: 14,
    fontWeight: "500",
  },
  unpaidName: {
    color: "#ff5252",
    fontSize: 14,
    fontWeight: "500",
  },
  paidStatus: {
    color: "#00e676",
    fontWeight: "bold",
    fontSize: 15,
    marginTop: 8,
  },
  requestButton: {
    backgroundColor: "#ff6f00",
    paddingVertical: 6,
    paddingHorizontal: 12,
    color: "#fff",
    fontWeight: "bold",
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 10,
    textAlign: "center",
  },
  lightsOn: {
    marginTop: 10,
    fontWeight: "600",
    color: "#00e676",
  },
  lightsOff: {
    marginTop: 10,
    fontWeight: "600",
    color: "#ff3d00",
  },    
  lightsText: {
    marginTop: 10,
    color: "#aaa",
  },
  noPlayers: {
    fontStyle: "italic",
    color: "#aaa",
    marginTop: 6,
    fontSize: 14,
  },
  error: {
    padding: 16,
    color: "red",
    fontWeight: "600",
  },
  loading: {
    padding: 16,
    fontStyle: "italic",
    color: "#ffffff",
  },
});
