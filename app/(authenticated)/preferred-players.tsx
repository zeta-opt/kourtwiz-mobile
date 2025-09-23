import UserAvatar from '@/assets/UserAvatar';
import PreferredPlayersModal, {
  Contact,
} from '@/components/preferred-players-modal/PreferredPlayersModal';
import { useGetUserDetails } from '@/hooks/apis/player-finder/useGetUserDetails';
import { useUpdateUserById } from '@/hooks/apis/user/useUpdateUserById';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Searchbar } from 'react-native-paper';
import { useSelector } from 'react-redux';

const PreferredPlayersScreen = () => {
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.user);
  const userId = user?.userId;
  const { data: userData, status } = useGetUserDetails({ userId });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(status === 'loading');
  }, [status]);

  const [preferredPlayers, setPreferredPlayers] = useState<Contact[]>([]);
  const [showRegisteredModal, setShowRegisteredModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredPreferredPlayers, setFilteredPreferredPlayers] = useState<
    Contact[]
  >([]);
  const { updateUserById } = useUpdateUserById();

  // --- Normalize contact ---
  const normalizeContact = (c: any): Contact => ({
    contactName: c.contactName ?? c.name ?? '',
    contactPhoneNumber: c.contactPhoneNumber ?? c.phoneNumber ?? '',
  });

  // --- Ensure uniqueness by phone number ---
  const setUniquePreferredPlayers = (players: Contact[]) => {
    const unique = new Map<string, Contact>();
    players.forEach((p) => {
      const normalized = normalizeContact(p);
      if (normalized.contactPhoneNumber) {
        unique.set(normalized.contactPhoneNumber, normalized);
      }
    });
    setPreferredPlayers(Array.from(unique.values()));
  };

  // --- Load from API (dedupe immediately) ---
  useEffect(() => {
    const fetched = userData?.playerDetails?.preferToPlayWith ?? [];
    setUniquePreferredPlayers(fetched);
  }, [userData]);

  const isSelected = (phoneNumber: string) =>
    preferredPlayers.some((p) => p.contactPhoneNumber === phoneNumber);

  const toggleSelect = (item: Contact) => {
    if (isSelected(item.contactPhoneNumber)) {
      setUniquePreferredPlayers(
        preferredPlayers.filter(
          (p) => p.contactPhoneNumber !== item.contactPhoneNumber
        )
      );
    } else {
      setUniquePreferredPlayers([...preferredPlayers, item]);
    }
  };

  const handleSavePreferredPlayers = async () => {
    try {
      // Deduplicate by phone number
      const uniqueMap = new Map<string, Contact>();
      preferredPlayers.forEach((p) => {
        const normalized = normalizeContact(p);
        if (normalized.contactPhoneNumber) {
          uniqueMap.set(normalized.contactPhoneNumber, normalized);
        }
      });

      const uniquePreferredPlayers = Array.from(uniqueMap.values());
      const payload = {
        playerDetails: {
          preferToPlayWith: uniquePreferredPlayers.map((p) => ({
            contactName: p.contactName,
            contactPhoneNumber: p.contactPhoneNumber,
          })),
        },
      };

      await updateUserById(userId, payload);

      setPreferredPlayers(uniquePreferredPlayers);
      setShowRegisteredModal(false);
      router.replace('/profile');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save preferred players.');
    }
  };

  // --- Search ---
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredPreferredPlayers(preferredPlayers);
      return;
    }

    const lower = searchText.toLowerCase();
    const filtered = preferredPlayers.filter((player) => {
      const name = player.contactName?.toLowerCase() || '';
      const phone = player.contactPhoneNumber?.toLowerCase() || '';
      return name.includes(lower) || phone.includes(lower);
    });

    setFilteredPreferredPlayers(filtered);
  }, [searchText, preferredPlayers]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior='padding'
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace('/profile')}
            style={styles.backButton}
          >
            <Ionicons name='chevron-back' size={24} color='#000' />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Preferred Players</Text>
          <UserAvatar size={32} onPress={() => console.log('Clicked Avatar')} />
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder='Search'
            onChangeText={setSearchText}
            value={searchText}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor='#666'
            placeholderTextColor='#9F9F9F'
            theme={{
              colors: {
                primary: '#2C7E88',
                text: '#000',
                placeholder: '#9F9F9F',
              },
            }}
          />
        </View>

        {/* Loader */}
        {isLoading && (
          <View style={{ padding: 10, alignItems: 'center' }}>
            <ActivityIndicator size='small' color='#2CA6A4' />
            <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
              Loading preferred players...
            </Text>
          </View>
        )}

        {/* List or empty message (only after loading) */}
        {!isLoading && (
          <>
            {preferredPlayers.length === 0 ? (
              <View style={styles.emptyMessageWrapper}>
                <Text style={styles.emptyMessage}>
                  No preferred players added yet.
                </Text>
              </View>
            ) : filteredPreferredPlayers.length === 0 ? (
              <View style={styles.emptyMessageWrapper}>
                <Text style={styles.emptyMessage}>No results found</Text>
              </View>
            ) : (
              <>
                <Text style={styles.sectionLabel}>
                  {preferredPlayers.length} Preferred Players Selected
                </Text>
                <View style={styles.optionsContainer}>
                  <FlatList
                    data={[...filteredPreferredPlayers].sort((a, b) =>
                      a.contactName
                        .toLowerCase()
                        .localeCompare(b.contactName.toLowerCase())
                    )}
                    keyExtractor={(item) => item.contactPhoneNumber}
                    keyboardShouldPersistTaps='handled'
                    renderItem={({ item }) => {
                      const checked = isSelected(item.contactPhoneNumber);
                      return (
                        <TouchableOpacity
                          style={styles.item}
                          onPress={() => toggleSelect(item)}
                        >
                          <View style={styles.iconCircle}>
                            <Ionicons name='person' size={16} color='#2CA6A4' />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.name}>{item.contactName}</Text>
                            <Text style={styles.phoneText}>
                              {item.contactPhoneNumber}
                            </Text>
                          </View>
                          <TouchableOpacity onPress={() => toggleSelect(item)}>
                            {checked ? (
                              <Ionicons
                                name='close-circle'
                                size={22}
                                color='#D4D4D4'
                              />
                            ) : (
                              <Ionicons
                                name='ellipse-outline'
                                size={22}
                                color='#327D85'
                              />
                            )}
                          </TouchableOpacity>
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              </>
            )}
          </>
        )}

        {/* FOOTER BUTTONS */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowRegisteredModal(true)}
          >
            <Text style={styles.addButtonText}>Add Players</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={handleSavePreferredPlayers}
          >
            <Text style={styles.doneButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* MODAL */}
        <PreferredPlayersModal
          visible={showRegisteredModal}
          onClose={() => setShowRegisteredModal(false)}
          onSelectPlayers={(selected) => {
            setUniquePreferredPlayers(selected);
          }}
          selectedPlayers={preferredPlayers}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PreferredPlayersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F7F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333',
  },
  phoneText: {
    fontSize: 14,
    color: '#666',
  },
  backButton: {
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  emptyMessageWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  emptyMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderColor: '#ECECEC',
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
    color: '#327D85',
  },
  doneButton: {
    backgroundColor: '#327D85',
    borderRadius: 32,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchBar: {
    backgroundColor: '#e5e5e5',
    borderRadius: 10,
    height: 45,
  },
  searchInput: {
    fontSize: 15,
    marginTop: -5,
    color: '#000',
  },
  sectionLabel: {
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  optionsContainer: {
    maxHeight: 500,
    marginTop: 20,
    marginHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
