import { RootState } from '@/store';
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import UserAvatar from '@/assets/UserAvatar';
import { router } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import { useUpdateUserById } from '@/hooks/apis/user/useUpdateUserById';
import { useGetUserDetails } from '@/hooks/apis/player-finder/useGetUserDetails';

type Place = {
  id: string;
  Name: string;
  Location?: string;
};

export default function PreferredPlacesScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: userData } = useGetUserDetails({userId: user?.userId ?? '', enabled: !!user?.userId});
  const { updateUserById } = useUpdateUserById();
  const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

  const [preferredPlaces, setPreferredPlaces] = useState<Place[]>([]);
  const [suggestedPlaces, setSuggestedPlaces] = useState<Place[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [filteredPreferredPlaces, setFilteredPreferredPlaces] = useState<Place[]>(preferredPlaces);
  const [filteredSuggestedPlaces, setFilteredSuggestedPlaces] = useState<Place[]>(suggestedPlaces);
  const [initialPreferredIds, setInitialPreferredIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const newSelections = selectedPlaces.filter(id => !initialPreferredIds.includes(id));
  const isAddDisabled = newSelections.length === 0;
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [searchText, setSearchText] = useState('');  
  const normalizePlace = (place: any): Place => ({
    id: String(place.id).trim(),
    Name: place.Name || place.name || 'Unnamed Place',
    Location: place.Location || place.location || '',
  });  

  // Initialize selected preferred IDs when modal opens
  useEffect(() => {
    if (showPlaceModal && preferredPlaces.length) {
      setInitialPreferredIds(preferredPlaces.map((place) => place.id));
      setSelectedPlaces(preferredPlaces.map((place) => place.id));
    }
  }, [showPlaceModal, preferredPlaces]);

  // Fetch preferred + suggested places when userData is available
  useEffect(() => {
    if (!userData) return;

    const fetchSuggestedPlaces = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const preferred: Place[] = (userData.playerDetails?.preferPlacesToPlay || []).map(normalizePlace);
        const preferredIds = new Set(preferred.map((p) => p.id));

        // Build the query for nearby places
        const queryParams = new URLSearchParams({
          userId: user?.userId ?? '',
          address: userData.address || '6 Parkwood Lane',
          city: userData.city || 'Mendham',
          state: userData.state || 'New Jersey',
          zipCode: userData.zipCode || '07945',
          country: userData.country || 'United States',
          maxDistanceInKm: '5',
          page: '0',
          limit: '20',
        }).toString();

        let nearby: Place[] = [];
        try {
          const nearbyRes = await axios.get(`${BASE_URL}/api/import/nearbyaddress?${queryParams}`);
          nearby = (nearbyRes.data || []).map(normalizePlace);
        } catch (err) {
          console.warn('⚠️ Nearby fetch failed', err);
          nearby = [];
        }

        const otherSuggested = nearby.filter((place) => !preferredIds.has(place.id));

        setPreferredPlaces(preferred);
        setSuggestedPlaces(otherSuggested);
        setSelectedPlaces(preferred.map((p) => p.id));
      } catch (err) {
        console.error('❌ Error processing suggested places:', err);
        Alert.alert('Error', 'Failed to load preferred places.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestedPlaces();
  }, [userData]);

  const handleSavePlaces = async (): Promise<void> => {
    if (!user?.userId) return;

    try {
      const payload = {
        playerDetails: {
          preferPlacesToPlay: selectedPlaces.map((id) => ({ id })),
          isAppDownloaded: true,
        },
      };

      await updateUserById(user.userId, payload);

      Alert.alert('Success', 'Preferred places updated.');
      setShowPlaceModal(false);

      setPreferredPlaces(
        [...preferredPlaces, ...suggestedPlaces]
          .filter((p) => selectedPlaces.includes(p.id))
          .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
      );

      router.replace('/profile');
    } catch (err) {
      console.error('❌ Update error:', err);
      Alert.alert('Error', 'Could not update preferred places.');
    }
  };

  const toggleSelect = (id: string): void => {
    setSelectedPlaces((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((placeId) => placeId !== id)
        : [...prevSelected, id]
    );
  };

  const filteredPlaces = useMemo(() => {
    const placeMap = new Map<string, Place>();
    [...preferredPlaces, ...suggestedPlaces].forEach((place) => {
      placeMap.set(place.id, place);
    });
    const allPlaces = Array.from(placeMap.values());
    const filtered = allPlaces.filter((place) => {
      const name = place.Name?.toLowerCase() || '';
      const location = place.Location?.toLowerCase() || '';
      const search = searchText.toLowerCase();
      return name.includes(search) || location.includes(search);
    });    
    const selectedData = filtered.filter((place) =>
      selectedPlaces.includes(place.id)
    );
    const unselectedData = filtered
      .filter((place) => !selectedPlaces.includes(place.id))
      .sort((a, b) => a.Name.localeCompare(b.Name));
    return { selectedData, unselectedData };
  }, [preferredPlaces, suggestedPlaces, selectedPlaces, searchText]);  

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredPreferredPlaces(preferredPlaces);
      setFilteredSuggestedPlaces(suggestedPlaces);
    } else {
      const lower = searchText.toLowerCase();
      const filteredPreferred = preferredPlaces.filter((place) => {
        const name = place.Name?.toLowerCase() || '';
        const location = place.Location?.toLowerCase() || '';
        return name.includes(lower) || location.includes(lower);
      });
      const filteredSuggested = suggestedPlaces.filter((place) => {
        const name = place.Name?.toLowerCase() || '';
        const location = place.Location?.toLowerCase() || '';
        return name.includes(lower) || location.includes(lower);
      });      
      setFilteredPreferredPlaces(filteredPreferred);
      setFilteredSuggestedPlaces(filteredSuggested);
    }
  }, [searchText, preferredPlaces, suggestedPlaces]);

  const renderPlaceItem = ({ item }: { item: Place }) => {
    const checked = selectedPlaces.includes(item.id);

    return (
      <TouchableOpacity style={styles.placeItem} onPress={() => toggleSelect(item.id)}>
        <View style={styles.iconCircle}>
          <FontAwesome5 name="map-marker-alt" size={16} color="#2CA6A4" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.placeName}>{item.Name}</Text>
          {item.Location && <Text style={styles.placeSubtitle}>{item.Location}</Text>}
        </View>

        <TouchableOpacity onPress={() => toggleSelect(item.id)}>
          {checked ? (
            <Ionicons name="close-circle" size={22} color="#D4D4D4" />
          ) : (
            <Ionicons name="ellipse-outline" size={22} color="#ccc" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/profile')} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferred Places</Text>
        <UserAvatar size={32} onPress={() => {}} />
      </View>

      <View style={styles.searchWrapper}>
        <TextInput
          placeholder="Search"
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
        {isLoading && (
          <View style={{ padding: 10, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#2CA6A4" />
            <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Loading places...</Text>
          </View>
        )}
      </View>
      
      {isLoading ? null : (
        <>
          {filteredPlaces.selectedData.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>{selectedPlaces.length} Preferred Places Selected</Text>
              <View style={styles.optionsContainer}>
                <FlatList
                  data={filteredPlaces.selectedData}
                  keyExtractor={(item) => `place-${item.id}`}
                  renderItem={renderPlaceItem}
                  keyboardShouldPersistTaps="handled"
                />
              </View>
            </>
          ) : (
            <View style={styles.emptyMessageWrapper}>
              <Text style={styles.emptyMessage}>No preferred places added yet.</Text>
            </View>
          )}
        </>
      )}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={() => setShowPlaceModal(true)} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Places</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueButton} onPress={handleSavePlaces}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      {/* Place Selection Modal */}
      <Modal
        visible={showPlaceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlaceModal(false)}
      >
        <View style={styles.modal_Overlay}>
          <View style={styles.modal_Container}>
            <Text style={styles.modal_Title}>Select Preferred Places</Text>
            <View style={styles.searchWrapper}>
              <TextInput
                placeholder="Search"
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Preferred Places */}
              <Text style={styles.label}>Your Preferred Places</Text>
                {filteredPlaces.selectedData.length > 0 ? (
                  filteredPlaces.selectedData.map((place) => (
                    <View key={`preferred-${place.id}`} style={styles.placeCard}>
                      <FontAwesome5 name="map-marker-alt" size={16} color="#2CA6A4" style={styles.placeIcon} />
                      <View>
                        <Text style={styles.placeNameText}>{place.Name?.trim() || 'Unnamed Place'}</Text>
                        {place.Location && (
                          <Text style={styles.placeSubtitle}>{place.Location}</Text>
                        )}
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: '#888', textAlign: 'center', marginBottom: 10 }}>
                    No preferred places selected yet
                  </Text>
                )}
              <View style={{ marginVertical: 10 }} />

              {/* Suggested Places */}
              <Text style={styles.label}>Suggested Places</Text>
              {filteredSuggestedPlaces.length > 0 ? (
                filteredSuggestedPlaces.map((place) => (
                  <TouchableOpacity
                    key={place.id}
                    style={[
                      styles.timeOption,
                      selectedPlaces.includes(place.id) && styles.timeOptionSelected,
                    ]}
                    onPress={() => toggleSelect(place.id)}
                  >
                    <View>
                      <Text
                        style={[
                          styles.timeOptionText,
                          selectedPlaces.includes(place.id) && styles.timeOptionTextSelected,
                        ]}
                      >
                        {place.Name?.trim() || 'Unnamed Place'}
                      </Text>
                      {place.Location && (
                        <Text style={styles.placeSubtitle}>
                          <FontAwesome5 name="map-marker-alt" size={16} color="#2CA6A4" style={styles.placeIcon} /> {place.Location}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{ color: '#888', textAlign: 'center' }}>
                  No suggestions found
                </Text>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => {
                  if (isAddDisabled) {
                    Alert.alert('No Selection', 'Please select at least one new place to proceed.');
                  } else {
                    setShowPlaceModal(false);
                  }
                }}
              >
                <Text style={styles.saveButtonText}>Add Places</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPlaceModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
  },
  backButton: { 
    width: 32, 
    justifyContent: 'center', 
    alignItems: 'flex-start' 
  },
  headerTitle: { 
    flex: 1, 
    fontSize: 20, 
    fontWeight: '700', 
    textAlign: 'center', 
    color: '#333' 
  },
  searchWrapper: { 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    backgroundColor: '#FFFFFF' 
  },
  searchInput: {
    height: 40,
    backgroundColor: '#D4D4D4',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#333',
  },
  sectionLabel: {
    paddingHorizontal: 12,
    paddingTop: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  placesList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    borderRadius: 12,
    elevation: 3,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 8,
    borderBottomWidth: 1,
    borderColor: '#ECECEC',
  },
  placeSubtitle: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
    marginLeft: 2,
  },  
  optionsContainer: {
    maxHeight: 550,
    margin: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 3,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D9E5E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeName: { flex: 1, 
    fontSize: 15, 
    color: '#222' 
  },
  buttonsContainer: { 
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12, 
    paddingBottom: 4, 
    paddingTop: 5, 
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  addButton: {
    borderWidth: 2,
    borderColor: '#327D85',
    borderRadius: 32,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: { 
    fontSize: 17, 
    fontWeight: '600', 
    color: '#327D85' 
  },
  continueButton: {
    backgroundColor: '#327D85',
    borderRadius: 32,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  continueButtonText: { 
    fontSize: 17, 
    fontWeight: '600', 
    color: '#FFFFFF' 
  },
  emptyMessageWrapper: { 
    paddingHorizontal: 16, 
    paddingVertical: 20 
  },
  emptyMessage: { 
    fontSize: 15, 
    color: '#666', 
    textAlign: 'center' 
  },
  sectionCard: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#F7F7F7',
    borderBottomWidth: 1,
    borderColor: '#EDEDED',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalButtons: {
    backgroundColor: '#327D85',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modal_Overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal_Container: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  modal_Title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#222',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginVertical: 8,
  },
  timeOption: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#EDEDED',
    marginVertical: 4,
  },
  timeOptionSelected: {
    backgroundColor: '#327D85',
  },
  timeOptionText: {
    fontSize: 15,
    color: '#333',
  },
  timeOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  modalActions: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#327D85',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#ddd',
    padding: 12,
    alignItems: 'center',
    borderRadius: 32,
    height: 48,
    justifyContent: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 16,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  placeIcon: {
    marginRight: 10,
  },
  placeNameText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});