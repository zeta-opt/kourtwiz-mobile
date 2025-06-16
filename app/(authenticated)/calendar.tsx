import { CalendarProvider } from '@/components/events/CalendarContext';
import CalendarWeekView from '@/components/events/components/CalendarWeekView';
import EventFormModal from '@/components/events/components/EventFormModal';
import { StyleSheet, Text, View } from 'react-native';


export default function Calendar() {
    return (
        <CalendarProvider>
          <View style={styles.container}>
            <CalendarWeekView />
            <EventFormModal />
          </View>
        </CalendarProvider>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#fff',
      },
    });