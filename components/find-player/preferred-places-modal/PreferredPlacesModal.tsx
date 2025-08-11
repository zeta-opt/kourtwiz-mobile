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
  FlatList,
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Icon, Portal, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

type Props = {
  visible: boolean;
  handleClose: () => void;
  locationPermissionGranted?: boolean | null;
};

type Coordinates = { lat: number; lng: number } | null;

type CombinedPlace = {
  id: string;
  name: string;
  isPreferred: boolean;
  courtType?: string;
  distance?: number;
};

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
  const [page, setPage] = useState(0);
  const [places, setPlaces] = useState<CombinedPlace[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const isSearching = query.trim().length > 0;

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
    isFetching,
  } = useGetSearchPlaces({
    lat: coords?.lat ?? 0,
    lng: coords?.lng ?? 0,
    maxDistanceInKm: 30,
    page,
    limit: 20,
  });

  // Reset on modal open
  useEffect(() => {
  if (!visible) {
    setSelectedPlace(null);
    setQuery('');
    setCoords(null);
    setPlaces([]);
    setPage(0);
    setHasMore(true);
  }
}, [visible]);

  // Refetch when coords are available
  useEffect(() => {
    if (coords?.lat && coords?.lng) {
      refetch();
    }
  }, [coords]);

  // Update place list when new nearby data loads
  useEffect(() => {
  if (nearbyPlaces && coords) {
    const preferredIds = new Set(
      preferredPlaces?.map((p) => p.id) ?? []
    );

    const preferredNames = new Set(
      preferredPlaces?.map((p) => p.name.toLowerCase()) ?? []
    );

    const newPlaces: CombinedPlace[] = nearbyPlaces
      .filter(
        (court) =>
          typeof court.Name === 'string' &&
          !preferredIds.has(court.id) &&
          !preferredNames.has(court.Name.toLowerCase())
      )
      .map((court) => ({
        id: court.id || court.Name,
        name: court.Name,
        isPreferred: false,
        courtType: court['Court Type'],
        distance: court.distance,
      }));

    setPlaces((prev) => {
      // Remove any duplicates already present
      const existingIds = new Set(prev.map((p) => p.id));
      const uniqueNewPlaces = newPlaces.filter((p) => !existingIds.has(p.id));

      const combined = [...prev, ...uniqueNewPlaces];

      if (uniqueNewPlaces.length < 20 || newPlaces.length === 0) {
        setHasMore(false);
      }

      return combined;
    });
  }
}, [nearbyPlaces]);

  const handlePlaceSelection = (placeName: string) => {
    dispatch(setPlaceToPlay(placeName));
    dispatch(closePreferredPlaceModal());
    handleClose();
  };

  // Combine preferred + nearby for display
  const combinedPlaces: CombinedPlace[] = [
    ...(preferredPlaces?.map((place) => ({
      id: place.id,
      name: place.name,
      isPreferred: true,
    })) ?? []),
    ...places,
  ];

  const filteredPlaces = combinedPlaces.filter((place) =>
    place.name.toLowerCase().includes(query.toLowerCase())
  );

  const isLoading =
    preferredStatus === 'loading' ||
    (locationPermissionGranted && nearbyStatus === 'loading' && !coords);

  const loadMore = () => {
    if (!isSearching && !isFetching && hasMore && !isFetchingMore) {
      setIsFetchingMore(true);
      setPage((prev) => prev + 1);
      setTimeout(() => {
        setIsFetchingMore(false);
      }, 500); // add slight delay to avoid flicker
    }
  };

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
              {/* Search Input */}
              <View style={styles.searchContainer}>
                <Icon source='magnify' size={20} color='#666' />
                <TextInput
                  placeholder='Select Court'
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
                <FlatList
                  data={filteredPlaces}
                  keyExtractor={(item) =>
                    `${item.isPreferred ? 'preferred' : 'nearby'}-${item.id || item.name}`
                  }
                    renderItem={({ item: place }) => (
                    <TouchableOpacity
                      style={[
                        styles.placeItem,
                        selectedPlace === place.name &&
                          styles.selectedPlaceItem,
                      ]}
                      onPress={() => setSelectedPlace(place.name)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.placeContent}>
                        <View style={styles.courtTextContainer}>
                          <Text
                            style={[
                              styles.placeText,
                              selectedPlace === place.name &&
                                styles.selectedText,
                            ]}
                          >
                            {place.name}
                            {place.isPreferred && (
                              <Icon
                                source="check"
                                size={20}
                                color="#2C7E88"
                                style={styles.preferredIcon}
                              />
                            )}
                          </Text>

                          {!place.isPreferred && (
                            <View style={styles.courtSubInfo}>
                              {place.courtType && (
                                <Text style={styles.courtTypeText}>
                                  {place.courtType}
                                </Text>
                              )}
                              {place.distance && (
                                <Text style={styles.distanceText}>
                                  {place.distance < 1
                                    ? `${Math.round(place.distance * 1000)}m`
                                    : `${place.distance.toFixed(1)}km`}
                                </Text>
                              )}
                            </View>
                          )}
                        </View>
                      </View>

                      {selectedPlace === place.name && (
                        <Icon source="check-circle" size={20} color="#2C7E88" />
                      )}
                    </TouchableOpacity>
                  )}
                  onEndReached={loadMore}
                  onEndReachedThreshold={0.6}
                  keyboardShouldPersistTaps="handled"
                  ListFooterComponent={() =>
                    !isSearching && isFetchingMore ? (
                      <ActivityIndicator
                        size="small"
                        style={{ marginVertical: 16 }}
                      />
                    ) : null
                  }
                  ListEmptyComponent={() => (
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
                />
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
  placeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferredIcon: {
    marginRight: 8,
  },
  courtTextContainer: {
    flex: 1,
  },
  placeText: {
    fontSize: 16,
    color: '#000',
  },
  selectedText: {
    color: '#2C7E88',
    fontWeight: '600',
  },
  courtSubInfo: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  courtTypeText: {
    fontSize: 13,
    color: '#666',
  },
  distanceText: {
    fontSize: 12,
    color: '#2C7E88',
    fontWeight: '500',
  },
  emptyStateContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
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
    backgroundColor: '#2C7E88',
  },
});
