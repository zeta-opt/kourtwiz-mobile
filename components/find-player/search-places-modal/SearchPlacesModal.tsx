import { useGetSearchPlaces } from '@/hooks/apis/player-finder/useGetSearchPlaces';
import { setPlaceToPlay } from '@/store/playerFinderSlice';
import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Button, Card, Modal, Portal, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';

type Props = {
  visible: boolean;
  handleClose: () => void;
};

const SearchPlacesModal = ({ visible, handleClose }: Props) => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  type Coordinates = { lat: number; lng: number } | null;
  const [coords, setCoords] = useState<Coordinates>(null);
  const getLocationPermissionType = () => {
  if (Platform.OS === 'android') {
    return PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
  } else if (Platform.OS === 'ios') {
    return PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
  }
  return null;
};

  // Fetch user location on mount
  useEffect(() => {
    if (!visible) return;

    const getLocation = async () => {
      const permission = getLocationPermissionType();
      if (!permission) return;

      const status = await check(permission);

      if (status === RESULTS.GRANTED) {
        await fetchLocation();
      } else if (status === RESULTS.DENIED || status === RESULTS.LIMITED) {
        const result = await request(permission);
        if (result === RESULTS.GRANTED) {
          await fetchLocation();
        } else {
          console.warn('Location permission denied');
        }
      } else if (status === RESULTS.BLOCKED) {
        console.warn('Location permission blocked. Prompt user to enable it in settings.');
      }
    };

    const fetchLocation = async () => {
      try {
        const location = await Location.getCurrentPositionAsync({});
        setCoords({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      } catch (err) {
        console.error('Failed to get location:', err);
      }
    };

    getLocation();
  }, [visible]);


  useEffect(() => {
    if (coords?.lat && coords?.lng) {
      refetch();
    }
  }, [coords]);

  const {
    data: places,
    status,
    refetch,
  } = useGetSearchPlaces({
    lat: coords?.lat ?? 0,
    lng: coords?.lng ?? 0,
    maxDistanceInKm: 50,
    page: 0,
    limit: 50,
  });

  const filteredCourts =
    places?.filter(
      (place) =>
        typeof place.Name === 'string' &&
        place.Name.toLowerCase().includes(query.toLowerCase())
    ) ?? [];

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={styles.modal}
      >
        <Text style={styles.heading}>Search Nearby Courts</Text>

        <TextInput
          placeholder='Search courts...'
          style={styles.input}
          value={query}
          onChangeText={setQuery}
        />

        {status === 'loading' ? (
          <ActivityIndicator size='large' style={{ marginVertical: 20 }} />
        ) : status === 'error' ? (
          <Text>Error fetching courts. Please try again.</Text>
        ) : filteredCourts.length === 0 ? (
          <Text>No matching courts found.</Text>
        ) : (
          <FlatList
            data={filteredCourts}
            keyExtractor={(item) => item.id || item.name}
            renderItem={({ item }) => (
              <Card
                style={styles.card}
                onPress={() => {
                  dispatch(setPlaceToPlay(item.Name));
                  handleClose();
                }}
              >
                <Card.Content>
                  <Text style={styles.cardTitle}>{item.Name}</Text>
                  <Text style={styles.courtType}>{item['Court Type']}</Text>
                </Card.Content>
              </Card>
            )}
          />
        )}
        <Button onPress={refetch}>Retry Fetch</Button>
        <Button onPress={handleClose} style={styles.closeButton}>
          Cancel
        </Button>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    maxHeight: '90%',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
    borderRadius: 6,
  },
  card: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  courtType: {
    fontSize: 12,
    color: '#666',
  },
  closeButton: {
    marginTop: 0,
  },
});

export default SearchPlacesModal;
