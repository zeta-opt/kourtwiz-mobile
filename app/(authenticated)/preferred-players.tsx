import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Modal,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import {setPreferredContacts,} from '@/store/playerFinderSlice';
import { useGetUserDetails } from '@/hooks/apis/player-finder/useGetUserDetails';
import PreferredPlayersModal, {Contact} from '@/components/preferred-players-modal/PreferredPlayersModal';
import ContactsModal from '@/components/find-player/contacts-modal/ContactsModal';
import { getToken } from '@/shared/helpers/storeToken';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import UserAvatar from '@/assets/UserAvatar';
  
const PreferredPlayersScreen = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const user = useSelector((state: any) => state.auth.user);
    const userId = user?.userId;
    const { data: userData, preferredPlayers: fetchedPreferredPlayers } = useGetUserDetails(userId);
    const [preferredPlayers, setPreferredPlayersLocal] = useState<Contact[]>([]);
    const [showOptionModal, setShowOptionModal] = useState(false);
    const [showContactsModal, setShowContactsModal] = useState(false);
    const [showRegisteredModal, setShowRegisteredModal] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredPreferredPlayers, setFilteredPreferredPlayers] = useState<Contact[]>([]);

    useEffect(() => {
        if (fetchedPreferredPlayers) {
          const normalized = fetchedPreferredPlayers.map(normalizeContact);
          setPreferredPlayersLocal(normalized);
          dispatch(setPreferredContacts(normalized));
        }
      }, [fetchedPreferredPlayers]);      

    const normalizeContact = (c: any): Contact => ({
        contactName: c.contactName ?? c.name ?? '',
        contactPhoneNumber: c.contactPhoneNumber ?? c.phoneNumber ?? '',
    });
    const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

    useEffect(() => {
        if (fetchedPreferredPlayers) {
            dispatch(setPreferredContacts(fetchedPreferredPlayers.map(normalizeContact)));
        }
    }, [fetchedPreferredPlayers]);

    const isSelected = (phoneNumber: string) =>
        preferredPlayers.some(p => p.contactPhoneNumber === phoneNumber);

    const toggleSelect = (item: Contact) => {
        if (isSelected(item.contactPhoneNumber)) {
        setPreferredPlayersLocal(prev =>
            prev.filter(p => p.contactPhoneNumber !== item.contactPhoneNumber));
        } else {
        setPreferredPlayersLocal(prev => [...prev, item]);
        }
    }; 

    const handleSavePreferredPlayers = async () => {
        const token = await getToken();
    
        const updatedPlayerDetails = {
        ...userData?.playerDetails,
        preferToPlayWith: preferredPlayers, // <--- use local state
        };
    
        try {
        const res = await fetch(`${BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            ...userData,
            playerDetails: updatedPlayerDetails,
            }),
        });
  
        if (!res.ok) throw new Error('Failed to update preferred players.');
    
        dispatch(setPreferredContacts(preferredPlayers));
        setShowContactsModal(false);
        setShowRegisteredModal(false);
        setShowOptionModal(false);
        router.replace('/profile'); // move after save
        } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to save preferred players.');
        }
    };
    
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
              behavior="padding"
              style={{ flex: 1 }}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/profile')} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Preferred Players</Text>
                <UserAvatar size={32} onPress={() => console.log('Clicked Avatar')} />
            </View>

            <View style={styles.searchWrapper}>
            <TextInput
                placeholder="Search"
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
            />
            </View>

            {preferredPlayers.length === 0 ? (
                <View style={styles.emptyMessageWrapper}>
                    <Text style={styles.emptyMessage}>No preferred players added yet.</Text>
                </View>
            ) : (
                <>
                    <Text style={styles.sectionLabel}>{preferredPlayers.length} Preferred Players Selected</Text>
                    <View style={styles.optionsContainer}>
                        <FlatList
                            data={[...filteredPreferredPlayers].sort((a, b) =>
                                a.contactName.toLowerCase().localeCompare(b.contactName.toLowerCase())
                              )}
                            keyExtractor={(item) => item.contactPhoneNumber}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => {
                                const checked = isSelected(item.contactPhoneNumber);
                            
                                return (
                                <TouchableOpacity style={styles.item} onPress={() => toggleSelect(item)}>
                                    <View style={styles.iconCircle}>
                                        <Ionicons name="person" size={16} color="#2CA6A4" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.name}>{item.contactName}</Text>
                                        <Text style={styles.phoneText}>{item.contactPhoneNumber}</Text>
                                    </View>
                                    <Checkbox
                                    status={checked ? 'checked' : 'unchecked'}
                                    onPress={() => toggleSelect(item)}
                                    color="#327D85"
                                    />
                                </TouchableOpacity>
                                );
                            }}
                        />
                  </View>
                </>
            )}

            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.addButton} onPress={() => setShowOptionModal(true)}>
                    <Text style={styles.addButtonText}>Add Players</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.doneButton} onPress={handleSavePreferredPlayers}>
                    <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
            </View>

            {/* Options Modal */}
            <Modal visible={showOptionModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.optionModalContainer}>
                    <TouchableOpacity
                        style={styles.optionButton}
                        onPress={() => {
                        setShowOptionModal(false);
                        setShowRegisteredModal(true);
                        }}
                    >
                        <Text style={styles.optionButtonText}>Add from Registered Players</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.optionButton}
                        onPress={() => {
                        setShowOptionModal(false);
                        setShowContactsModal(true);
                        }}
                    >
                        <Text style={styles.optionButtonText}>Add from Contacts</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.optionButton, { backgroundColor: '#ffe6e6' }]}
                        onPress={() => setShowOptionModal(false)}
                    >
                        <Text style={[styles.optionButtonText, { color: 'red' }]}>Cancel</Text>
                    </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <PreferredPlayersModal
                visible={showRegisteredModal}
                onClose={() => setShowRegisteredModal(false)}
                onSelectPlayers={(selected) => {
                    setPreferredPlayersLocal(selected.map(normalizeContact));
                }}
                selectedPlayers={preferredPlayers}
            />

            <ContactsModal
                visible={showContactsModal}
                onClose={() => setShowContactsModal(false)}
                onSelectContacts={(selected) => {
                    setPreferredPlayersLocal(selected.map(normalizeContact));
                }}
                selectedContacts={preferredPlayers}
            />
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PreferredPlayersScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff', },  
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
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
        paddingVertical: 20 
    },
    emptyMessage: { 
        fontSize: 15, 
        color: '#666', 
        textAlign: 'center' 
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingLeft: 16,
        paddingRight: 8,
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
        color: '#327D85' 
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
        color: '#FFFFFF' 
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
    optionsContainer: {
        maxHeight: 500,
        marginTop: 15,
        borderRadius: 8,
        backgroundColor: '#fff',
        elevation: 3,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionModalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 15,
        alignItems: 'center',
        elevation: 5, // for Android shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    optionButton: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#f2f2f2',
        alignItems: 'center',
        marginVertical: 6,
    },
    optionButtonText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    modalFooter: {
        flexDirection: 'row', justifyContent: 'space-around', padding: 10,
    },
    saveBtn: {
        backgroundColor: 'green', padding: 10, borderRadius: 8,
    },
    cancelBtn: {
        backgroundColor: 'gray', padding: 10, borderRadius: 8,
    },
    saveText: { color: 'white', fontWeight: 'bold' },
    cancelText: { color: 'white', fontWeight: 'bold' },
});
