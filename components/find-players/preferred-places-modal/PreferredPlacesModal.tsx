import { useGetPreferredPlaces } from '@/hooks/apis/player-finder/useGetPreferredPlaces';
import { useGetSearchPlaces } from '@/hooks/apis/player-finder/useGetSearchPlaces';
import LoaderScreen from '@/shared/components/Loader/LoaderScreen';
import { RootState } from '@/store';
import { setPlaceToPlay } from '@/store/playerFinderSlice';
import { closePreferredPlaceModal } from '@/store/uiSlice';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Divider, Icon, Portal, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

type Props = {
  visible: boolean;
  handleClose: () => void;
  locationPermissionGranted?: boolean | null;
};

type Coordinates = { lat: number; lng: number } | null;

const PreferredPlacesModal = ({
  visible,
  handleClose,
  locationPermissionGranted,
}: Props) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: preferredPlaces, status: preferredStatus } =
    useGetPreferredPlaces({
      userId: user?.userId,
    });
  const dispatch = useDispatch();
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState<Coordinates>(null);

  // Fetch user location when modal opens and location is permitted
  useEffect(() => {
    if (!visible || !locationPermissionGranted) return;

    const getLocation = async () => {
      try {
        const location = await Location.getCurrentPositionAsync({});
        setCoords({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };

    getLocation();
  }, [visible, locationPermissionGranted]);

  // Fetch nearby places
  const {
    data: nearbyPlaces,
    status: nearbyStatus,
    refetch,
  } = useGetSearchPlaces({
    lat: coords?.lat ?? 0,
    lng: coords?.lng ?? 0,
    maxDistanceInKm: 30,
    page: 0,
    limit: 30,
  });

  useEffect(() => {
    if (!visible) {
      setSelectedPlace(null);
      setQuery('');
      setCoords(null);
    }
  }, [visible]);

  // Refetch when coords are available
  useEffect(() => {
    if (coords?.lat && coords?.lng) {
      refetch();
    }
  }, [coords]);

  const handlePlaceSelection = (placeName: string) => {
    dispatch(setPlaceToPlay(placeName));
    dispatch(closePreferredPlaceModal());
    handleClose();
  };

  // Filter all places based on search query
  const filteredPreferredPlaces =
    preferredPlaces?.filter((place) =>
      place.name.toLowerCase().includes(query.toLowerCase())
    ) ?? [];

  const filteredNearbyCourts =
    nearbyPlaces?.filter(
      (place) =>
        typeof place.Name === 'string' &&
        place.Name.toLowerCase().includes(query.toLowerCase())
    ) ?? [];

  const isLoading =
    preferredStatus === 'loading' ||
    (locationPermissionGranted && nearbyStatus === 'loading' && !coords);

  return (
    <Portal>
      {visible && (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.contentArea}>
              <Text style={styles.heading}>Choose a place to play</Text>

              {/* Search Input */}
              <View style={styles.searchContainer}>
                <Icon source='magnify' size={20} color='#666' />
                <TextInput
                  placeholder='Search places...'
                  style={styles.searchInput}
                  value={query}
                  onChangeText={setQuery}
                  returnKeyType='search'
                  autoCapitalize='none'
                  autoCorrect={false}
                />
                {query.length > 0 && (
                  <TouchableOpacity onPress={() => setQuery('')}>
                    <Icon source='close-circle' size={20} color='#666' />
                  </TouchableOpacity>
                )}
              </View>

              {isLoading ? (
                <LoaderScreen />
              ) : (
                <ScrollView
                  style={styles.scrollArea}
                  contentContainerStyle={styles.scrollContent}
                  keyboardShouldPersistTaps='handled'
                  onScrollBeginDrag={Keyboard.dismiss}
                >
                  {/* Preferred Places Section */}
                  {filteredPreferredPlaces.length > 0 && (
                    <>
                      <Text style={styles.sectionTitle}>Preferred Places</Text>
                      {filteredPreferredPlaces.map((place) => (
                        <TouchableOpacity
                          key={place.id}
                          style={[
                            styles.placeItem,
                            selectedPlace === place.name &&
                              styles.selectedPlaceItem,
                          ]}
                          onPress={() => {
                            setSelectedPlace(place.name);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.placeText,
                              selectedPlace === place.name &&
                                styles.selectedText,
                            ]}
                          >
                            {place.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  {/* Divider between sections */}
                  {filteredPreferredPlaces.length > 0 &&
                    locationPermissionGranted &&
                    filteredNearbyCourts.length > 0 && (
                      <Divider style={styles.divider} />
                    )}

                  {/* Nearby Courts Section */}
                  {locationPermissionGranted && (
                    <>
                      {filteredNearbyCourts.length > 0 && (
                        <>
                          <Text style={styles.sectionTitle}>
                            <Icon source='map-marker' size={16} /> Nearby Courts
                          </Text>
                          {filteredNearbyCourts.slice(0, 30).map((court) => (
                            <TouchableOpacity
                              key={court.id || court.Name}
                              style={[
                                styles.placeItem,
                                selectedPlace === court.Name &&
                                  styles.selectedPlaceItem,
                              ]}
                              onPress={() => {
                                setSelectedPlace(court.Name);
                              }}
                              activeOpacity={0.7}
                            >
                              <View style={styles.courtTextContainer}>
                                <Text
                                  style={[
                                    styles.placeText,
                                    selectedPlace === court.Name &&
                                      styles.selectedText,
                                  ]}
                                >
                                  {court.Name}
                                </Text>
                                <View style={styles.courtSubInfo}>
                                  <Text style={styles.courtTypeText}>
                                    {court['Court Type']}
                                  </Text>
                                  {court.distance && (
                                    <Text style={styles.distanceText}>
                                      {court.distance < 1
                                        ? `${Math.round(
                                            court.distance * 1000
                                          )}m`
                                        : `${court.distance.toFixed(1)}km`}
                                    </Text>
                                  )}
                                </View>
                              </View>
                              {selectedPlace === court.Name && (
                                <Icon
                                  source='check-circle'
                                  size={20}
                                  color='#2C7E88'
                                />
                              )}
                            </TouchableOpacity>
                          ))}
                          {filteredNearbyCourts.length > 30 && (
                            <Text style={styles.moreResultsText}>
                              +{filteredNearbyCourts.length - 30} more courts
                              nearby
                            </Text>
                          )}
                        </>
                      )}
                      {/* Loading state for nearby courts */}
                      {!coords && (
                        <View style={styles.nearbyLoadingContainer}>
                          <ActivityIndicator size='small' />
                          <Text style={styles.nearbyLoadingText}>
                            Finding nearby courts...
                          </Text>
                        </View>
                      )}
                    </>
                  )}

                  {/* Empty state */}
                  {filteredPreferredPlaces.length === 0 &&
                    (!locationPermissionGranted ||
                      filteredNearbyCourts.length === 0) && (
                      <View style={styles.emptyStateContainer}>
                        <Text style={styles.emptyStateText}>
                          {query
                            ? 'No places found matching your search'
                            : locationPermissionGranted
                            ? 'No places available. Add preferred places or search nearby.'
                            : 'No preferred places yet. Add some to get started!'}
                        </Text>
                      </View>
                    )}
                </ScrollView>
              )}
            </View>

            {/* Action Button */}
            <View style={styles.buttonContainer}>
              <Button
                mode='contained'
                disabled={!selectedPlace}
                onPress={() => {
                  if (selectedPlace) {
                    handlePlaceSelection(selectedPlace);
                  }
                }}
                style={styles.doneButton}
              >
                Done
              </Button>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </Portal>
  );
};

export default PreferredPlacesModal;

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '75%',
    display: 'flex',
    flexDirection: 'column',
  },
  contentArea: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedPlaceItem: {
    backgroundColor: '#E9FCFE',
    borderWidth: 1.5,
    borderColor: '#2C7E88',
    elevation: 2,
  },
  placeText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  selectedText: {
    color: '#2C7E88',
    fontWeight: '600',
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#E0E0E0',
  },
  card: {
    marginBottom: 10,
    elevation: 1,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
  },
  selectedCard: {
    backgroundColor: '#E9FCFE',
    borderWidth: 1.5,
    borderColor: '#2C7E88',
    elevation: 3,
  },
  cardContent: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courtInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  courtType: {
    fontSize: 13,
    color: '#666',
  },
  courtDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courtDistance: {
    fontSize: 12,
    color: '#2C7E88',
    fontWeight: '500',
  },
  nearbyLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  nearbyLoadingText: {
    fontSize: 14,
    color: '#666',
  },
  emptyStateContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 4,
  },
  doneButton: {
    marginHorizontal: 0,
    elevation: 0,
  },
  moreResultsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    paddingVertical: 12,
    fontStyle: 'italic',
  },
});
