import { useGetPlays } from '@/hooks/apis/join-play/useGetPlays';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Menu, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import TopBarWithChips from '@/components/home-page/topBarWithChips';
import OpenPlayCard from '@/components/home-page/openPlayCard';

const OpenPlay = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const clubId = user?.currentActiveClubId || 'GLOBAL';
  const userId = user?.userId;

  const { data: plays, refetch } = useGetPlays(clubId, userId);
  const safePlays = plays ?? [];

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [locationMenuVisible, setLocationMenuVisible] = useState(false);

  const uniqueLocations: string[] = useMemo(() => {
    return Array.from(
      new Set(
        safePlays
          .map((p : any) => p.allCourts?.Name)
          .filter((name : any): name is string => typeof name === 'string')
      )
    );
  }, [safePlays]);

  const filteredPlays = useMemo(() => {
    return safePlays.filter((play : any) => {
      const [year, month, day, hour = 0, minute = 0] = play.startTime || [];
      if (!year || !month || !day) return false;

      const playDate = new Date(year, month - 1, day, hour, minute);

      const matchDate =
        !selectedDate ||
        (playDate.getFullYear() === selectedDate.getFullYear() &&
          playDate.getMonth() === selectedDate.getMonth() &&
          playDate.getDate() === selectedDate.getDate());

      const matchTime =
        !selectedTime ||
        (playDate.getHours() === selectedTime.getHours() &&
          playDate.getMinutes() === selectedTime.getMinutes());

      const matchLocation =
        !selectedLocation || play.allCourts?.Name === selectedLocation;

      return matchDate && matchTime && matchLocation;
    });
  }, [safePlays, selectedDate, selectedTime, selectedLocation]);

  const clearFiltersHandler = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedLocation(null);
  };
console.log('Filtered Plays:', filteredPlays);
  return (
    <LinearGradient colors={['#E0F7FA', '#FFFFFF']} style={{ flex: 1 }}>
      <TopBarWithChips active="open" />

      {/* Filter Row */}
      <View style={styles.filterRow}>
        {/* Date */}
        <Button
          mode="outlined"
          compact
          style={[styles.filterButtonSmall, selectedDate && styles.activeFilterButton]}
          contentStyle={styles.filterButtonContent}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={styles.buttonInner}>
            <Text style={styles.filterButtonLabel}>Date</Text>
            <MaterialIcons name="keyboard-arrow-down" size={16} />
          </View>
        </Button>

        {/* Time */}
        <Button
          mode="outlined"
          compact
          style={[styles.filterButtonSmall, selectedTime && styles.activeFilterButton]}
          contentStyle={styles.filterButtonContent}
          onPress={() => setShowTimePicker(true)}
        >
          <View style={styles.buttonInner}>
            <Text style={styles.filterButtonLabel}>Time</Text>
            <MaterialIcons name="keyboard-arrow-down" size={16} />
          </View>
        </Button>

        {/* Location */}
        <Menu
          visible={locationMenuVisible}
          onDismiss={() => setLocationMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              compact
              style={[styles.filterButtonLarge, selectedLocation && styles.activeFilterButton]}
              contentStyle={styles.filterButtonContent}
              onPress={() => setLocationMenuVisible(true)}
            >
              <View style={styles.buttonInner}>
                <Text style={styles.filterButtonLabel}>Location</Text>
                <MaterialIcons name="keyboard-arrow-down" size={16} />
              </View>
            </Button>
          }
        >
          {uniqueLocations.map((loc: string, index: number) => (
            <Menu.Item
              key={`${loc}-${index}`}
              onPress={() => {
                setSelectedLocation(loc);
                setLocationMenuVisible(false);
              }}
              title={loc}
            />
          ))}
        </Menu>

        {/* Clear Filters */}
        <Button
          mode="outlined"
          compact
          onPress={clearFiltersHandler}
          style={styles.smallClearButton}
          contentStyle={styles.filterButtonContent}
        >
          <Text style={styles.clearButtonLabel}>Clear filters</Text>
        </Button>
      </View>

      {/* Play Cards */}
      <ScrollView style={styles.container}>
        <View style={styles.con}>
          {filteredPlays.length > 0 ? (
            <OpenPlayCard cardStyle={styles.card} data={filteredPlays} refetch={refetch} />
          ) : (
            <Text style={styles.noPlaysText}>No open play sessions match your filters.</Text>
          )}
        </View>
      </ScrollView>

      {/* Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="calendar"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime || new Date()}
          mode="time"
          display="spinner"
          onChange={(event, time) => {
            setShowTimePicker(false);
            if (time) setSelectedTime(time);
          }}
        />
      )}
    </LinearGradient>
  );
};

export default OpenPlay;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    paddingTop: 12,
    padding: 8,
  },
  con: {
    padding: 12,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D0D7DD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  filterButtonSmall: {
    flex: 1,
    minWidth: 70,
    marginHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#008080',
    backgroundColor: '#FFFFFF',
    height: 40,
  },
  filterButtonLarge: {
    flex: 1.2,
    minWidth: 90,
    marginHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#008080',
    backgroundColor: '#FFFFFF',
    height: 40,
  },
  activeFilterButton: {
    backgroundColor: '#00808020',
  },
  smallClearButton: {
    flex: 1,
    borderColor: '#008080',
    borderWidth: 1,
    borderRadius: 25,
    marginHorizontal: 2,
    minWidth: 60,
    backgroundColor: '#008080',
    height: 40,
  },
  clearButtonLabel: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  filterButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonLabel: {
    fontSize: 12,
    color: '#000000',
  },
  noPlaysText: {
    textAlign: 'center',
    paddingVertical: 30,
    fontSize: 14,
    color: '#666',
  },
});
