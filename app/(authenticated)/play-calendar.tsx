import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import UserAvatar from '@/assets/UserAvatar';
import { useGetPlayerEventsByDate } from '@/hooks/apis/set-availability/useGetPlayerEventsByDate';

export default function PlayCalendarPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const userId = user?.userId;

  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState<string>(today);

  const { data: eventsForSelectedDate } = useGetPlayerEventsByDate(selectedDate, userId);
  console.log('events by date', eventsForSelectedDate)

  const parseArrayToDate = (arr: number[]): Date => {
    if (!arr || arr.length < 3) return new Date('');
    const [year, month, day, hour = 0, minute = 0] = arr;
    return new Date(year, month - 1, day, hour, minute);
  };
const mergedEvents = [
  ...(eventsForSelectedDate?.eventsAvailable ?? []).map(e => ({ ...e, type: 'available' })),
  ...(eventsForSelectedDate?.incomingPlayerFinderRequests ?? []).map(e => ({ ...e, type: 'incoming' })),
  ...(eventsForSelectedDate?.initiatedPlayerFinderRequests ?? []).map(e => ({ ...e, type: 'outgoing' })),
];

  const handlePress = (event: any) => {
  try {
    if (event.type === 'incoming') {
      router.push({
        pathname: '/(authenticated)/myRequestsDetailedView',
        params: { requestId: event.requestId },
      });
    } else if (event.type === 'outgoing') {
      const encoded = encodeURIComponent(JSON.stringify(event));
      router.push({
        pathname: '/(authenticated)/sentRequestsDetailedView',
        params: { data: encoded },
      });
    } else if (event.type === 'available') {
      router.push({
        pathname: '/(authenticated)/openPlayDetailedView',
        params: { sessionId: event.id },
      });
    }
  } catch (err) {
    console.error('Navigation error:', err);
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
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: '#00adf5',
            },
          }}
          style={styles.calendar}
        />

      <FlatList
          data={mergedEvents}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          ListEmptyComponent={
            <Text style={styles.noEvents}>No confirmed events for this date</Text>
          }
          renderItem={({ item }) => {
            let locationName = 'Unknown Location';
            if (item.type === 'available') {
              locationName = item.allCourts?.Name || 'Unknown Location';
            } else if (item.type === 'incoming' || item.type === 'outgoing') {
              locationName = item.placeToPlay || 'Unknown Location';
            }
            let start, end;
            if (item.type === 'available') {
              start = parseArrayToDate(item.startTime);
              end = new Date(start.getTime() + (item.durationMinutes ?? 0) * 60000);
            } else {
              start = parseArrayToDate(item.playTime);
              end = parseArrayToDate(item.playEndTime);
            }

            return (
              <TouchableOpacity onPress={() => handlePress(item)}>
                <View style={styles.eventCard}>
                  <Text style={styles.eventTitle}>{item.eventName || 'Event Name'}</Text>
                  <Text style={styles.eventLocation}>{locationName}</Text>
                  <Text style={styles.eventTime}>
                    {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
                  </Text>
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
