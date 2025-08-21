import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import UserAvatar from '@/assets/UserAvatar';
import { useGetPlayerEventsByDate } from '@/hooks/apis/set-availability/useGetPlayerEventsByDate';
import { useGetPlayerSchedule } from '@/hooks/apis/set-availability/useGetPlayerSchedule';
import { useGetInitiatedPlays } from '@/hooks/apis/join-play/useGetInitiatedPlays';

export default function PlayCalendarPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const userId = user?.userId;

  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState<string>(today);

  const { data: eventsForSelectedDate } = useGetPlayerEventsByDate(selectedDate, userId);
  
  const { data: schedule } = useGetPlayerSchedule(userId);
  const { data: initiatedData, status: initiatedStatus } =
      useGetInitiatedPlays(userId);

  const parseArrayToDate = (arr: number[]): Date => {
    if (!arr || arr.length < 3) return new Date('');
    const [year, month, day, hour = 0, minute = 0] = arr;
    return new Date(year, month - 1, day, hour, minute);
  };

const uniqueInitiatedPlayerFinderRequests = (
  eventsForSelectedDate?.initiatedPlayerFinderRequests ?? []
).filter((req, index, self) =>
  index === self.findIndex(r => r.requestId === req.requestId)
);

const mergedEvents = [
  ...(eventsForSelectedDate?.eventsAvailable ?? []).map(e => ({
    ...e,
    type: "available",
    start: parseArrayToDate(e.startTime),
    end: e.durationMinutes
      ? new Date(parseArrayToDate(e.startTime)!.getTime() + e.durationMinutes * 60000)
      : null,
  })),
  ...(eventsForSelectedDate?.incomingPlayerFinderRequests ?? []).map(e => ({
    ...e,
    type: "incoming",
    start: parseArrayToDate(e.playTime),
    end: parseArrayToDate(e.playEndTime),
  })),
  ...uniqueInitiatedPlayerFinderRequests
    .filter(e => e.status !== "WITHDRAWN")
    .map(e => ({
      ...e,
      type: "outgoing",
      start: parseArrayToDate(e.playTime),
      end: parseArrayToDate(e.playEndTime),
    })),
  ...(initiatedData ?? [])
    .map(e => {
      const start = parseArrayToDate(e.startTime);
      return {
        ...e,
        type: "initiated",
        start,
        end: e.durationMinutes
          ? new Date(start!.getTime() + e.durationMinutes * 60000)
          : null,
      };
    })
    .filter(e =>
      e.start ? format(e.start, "yyyy-MM-dd") === selectedDate : false
    ),
];


const markedDates = useMemo(() => {
  const marks: Record<string, any> = {};

  if (schedule) {
  const allEvents = [
    ...(schedule?.eventsAvailable ?? []).map(e => ({ ...e, type: "eventAvailable" })),
    ...(schedule?.eventsCreated ?? []).map(e => ({ ...e, type: "eventCreated" })),
    ...(schedule?.incomingPlayerFinderRequests ?? []).map(e => ({ ...e, type: "incomingPlayerFinder" })),
    ...(schedule?.initiatedPlayerFinderRequests ?? []).map(e => ({ ...e, type: "initiatedPlayerFinder" })),
  ];

  allEvents.forEach(event => {
    const dateObj = parseArrayToDate(event.startTime ?? event.playTime);
    if (!dateObj) return;

    const date = format(dateObj, "yyyy-MM-dd");

    let bgColor: string | null = null;

    if (event.type === "eventAvailable" || event.type === "eventCreated") {
      bgColor = "yellow";
    } else if (event.type === "incomingPlayerFinder") {
      if (event.status === "ACCEPTED") bgColor = "green";
      else if (event.status === "DECLINED") bgColor = "red";
      else bgColor = "yellow";
    } else if (event.type === "initiatedPlayerFinder") {
      if (event.status === "ACCEPTED") bgColor = "green";
      else if (event.status === "DECLINED") bgColor = "red";
      else if (event.status === "WITHDRAWN") bgColor = null;
      else bgColor = "yellow";
    }

    if (bgColor) {
      marks[date] = {
        customStyles: {
          container: {
            backgroundColor: bgColor,
            borderRadius: 4,
          },
          text: {
            color: "white",
            fontWeight: "bold",
          },
        },
      };
    }
  });
}

if (selectedDate) {
  marks[selectedDate] = {
    customStyles: {
      container: {
        backgroundColor: "#00adf5",
        borderRadius: 4,
      },
      text: {
        color: "white",
        fontWeight: "bold",
      },
    },
  };
}

  return marks;
}, [schedule, selectedDate]);

  const handlePress = (event: any) => {
  try {
    if (event.type === "incoming") {
      router.push({
        pathname: "/(authenticated)/myRequestsDetailedView",
        params: { requestId: event.requestId },
      });
    } else if (event.type === "outgoing") {
      const encoded = encodeURIComponent(JSON.stringify(event));
      router.push({
        pathname: "/(authenticated)/sentRequestsDetailedView",
        params: { data: encoded },
      });
    } else if (event.type === "available" || event.type === "initiated") {
      router.push({
        pathname: "/(authenticated)/openPlayDetailedView",
        params: { sessionId: event.id },
      });
    }
  } catch (err) {
    console.error("Navigation error:", err);
  }
};

  return (
    <View style={styles.Headercontainer}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace('/(authenticated)/home')}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#cce5e3" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Set Availability</Text>
        </View>
        <UserAvatar size={30} />
      </View>

      {/* Calendar */}
      <View style={styles.container}>
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          markingType="custom"
          style={styles.calendar}
        />

      <FlatList
          data={mergedEvents}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          ListEmptyComponent={
            <Text style={styles.noEvents}>No confirmed events for this date</Text>
          }
          renderItem={({ item }) => {
            let locationName = "Unknown Location";

            if (item.type === "available" || item.type === "initiated") {
              locationName = item.allCourts?.Name || "Unknown Location";
            } else if (item.type === "incoming" || item.type === "outgoing") {
              locationName = item.placeToPlay || "Unknown Location";
            }

            return (
              <TouchableOpacity onPress={() => handlePress(item)}>
                <View style={styles.eventCard}>
                  <Text style={styles.eventTitle}>{item.eventName || "Event Name"}</Text>
                  <Text style={styles.eventLocation}>{locationName}</Text>
                  {item.start && item.end && (
                    <Text style={styles.eventTime}>
                      {format(item.start, "h:mm a")} - {format(item.end, "h:mm a")}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}

        />

      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => setSelectedDate(today)}>
          <Text style={styles.navText}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(authenticated)/set-availability')}>
          <Text style={styles.navText}>Set Availability</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/(authenticated)/player-invitations?type=incoming')}>
          <Text style={styles.navText}>Inbox</Text>
        </TouchableOpacity> 
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
     flex: 1,
     backgroundColor: '#ffffff', 
    },
    Headercontainer:{
      flex: 1,
     backgroundColor: '#2F7C83',
     borderBottomRightRadius:25,
    },
   backButton: {
    paddingRight: 10,
    paddingVertical: 5,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    marginTop: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#0077cc',
    fontWeight: '500',
  },
  calendar: {
    borderRadius: 12,
    margin: 16,
  },
  noEvents: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  eventCard: {
    backgroundColor: '#e6f2f8',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },
  eventTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  eventLocation: {
    fontSize: 14,
    color: '#555',
    marginVertical: 2,
  },
  eventTime: {
    fontSize: 14,
    color: '#333',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    backgroundColor: '#f9f9f9',
  },
  navText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0077cc',
  },
});
