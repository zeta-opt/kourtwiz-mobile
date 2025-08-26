import { useGetRegisteredPlayers } from '@/hooks/apis/player-finder/useGetRegisteredPlayers';
import { useGetUserDetails } from '@/hooks/apis/player-finder/useGetUserDetails';
import * as Contacts from 'expo-contacts';
import { useGetGroupsByPhoneNumber } from '@/hooks/apis/groups/useGetGroups';
import { RootState } from '@/store';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Text as RNText,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Checkbox, Searchbar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';

export interface Contact {
  contactName: string;
  contactPhoneNumber: string;
}

interface PreferredPlayersModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlayers: (players: Contact[]) => void;
  selectedPlayers: Contact[];
}

const chips = [
  { key: 'selected', label: 'Selected Players' },
  { key: 'registered', label: 'Registered Players' },
  { key: 'preferred', label: 'Preferred Players' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'groups', label: 'Groups' },
];

const PreferredPlayersModal: React.FC<PreferredPlayersModalProps> = ({
  visible,
  onClose,
  onSelectPlayers,
  selectedPlayers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceContacts, setDeviceContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  // Normalize numbers
  const normalizePhoneNumber = (phone: string) => {
    return phone.trim().replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  };
  const [tempSelectedPlayers, setTempSelectedPlayers] = useState<Contact[]>([]);
  const [tempSelectedGroupIds, setTempSelectedGroupIds] = useState<string[]>([]);
  const [activeChip, setActiveChip] = useState<'selected' | 'registered' | 'preferred' | 'contacts' | 'groups'>('registered');

  // Get user ID from Redux store
  const user = useSelector((state: RootState) => state.auth?.user);
  const userId = useSelector((state: RootState) => state.auth?.user?.id || '');
  const currentUserPhone = normalizePhoneNumber(user?.phoneNumber || '');
  const currentUserName = user?.name?.toLowerCase?.() || '';
  const { getGroups, data: groupsData, status: groupsStatus } = useGetGroupsByPhoneNumber();

  interface Group {
    id: string;
    groupName: string;
    members: { name?: string; phoneNumber?: string }[];
    membersCount: number;
  }  
  
  const loadDeviceContacts = async () => {
    setLoadingContacts(true);
    try {
      const { status } = await Contacts.getPermissionsAsync();
      if (status !== 'granted') return;
  
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        sort: Contacts.SortTypes.FirstName,
      });
  
      const transformed: Contact[] = data
        .filter((c) => c.name && c.phoneNumbers?.length)
        .map((c) => ({
          contactName: c.name,
          contactPhoneNumber: normalizePhoneNumber(
            c.phoneNumbers?.[0]?.number ?? c.id ?? ''
          ),
        }));
  
      setDeviceContacts(transformed);
    } catch (err) {
      console.error('Error loading contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };  

  // Load on modal open
  useEffect(() => {
    if (visible) {
      loadDeviceContacts();
    }
  }, [visible]);

  useEffect(() => {
    if (user?.phoneNumber) {
      getGroups({ phoneNumber: user.phoneNumber });
    }
  }, [user?.phoneNumber]);

  // Fetch full user details (we'll read preferToPlayWith from playerDetails)
  const { data: userDetails, status: userStatus } = useGetUserDetails({
    userId,
    enabled: visible,
  });

  // Fetch registered players
  const {
    data: registeredPlayers,
    status: registeredStatus,
  } = useGetRegisteredPlayers({
    enabled: visible,
  });

  useEffect(() => {
    if (visible) {
      setTempSelectedPlayers(selectedPlayers);
    }
  }, [visible, selectedPlayers]);

  const handleTogglePlayer = (player: Contact) => {
    if (!player.contactPhoneNumber) return;

    const isSelected = tempSelectedPlayers.some(
      (p) =>
        p.contactPhoneNumber === player.contactPhoneNumber &&
        p.contactName === player.contactName
    );

    if (isSelected) {
      setTempSelectedPlayers((prev) =>
        prev.filter((p) => p.contactPhoneNumber !== player.contactPhoneNumber)
      );
    } else {
      setTempSelectedPlayers((prev) => [...prev, player]);
    }
  };

  const handleSave = () => {
    onSelectPlayers(
      tempSelectedPlayers.filter((p) => p.contactName !== user.name)
    );
    onClose();
  }; 

  const handleCancel = () => {
    setTempSelectedPlayers(selectedPlayers);
    onClose();
  };

  const isPlayerSelected = (player: Contact) => {
    return tempSelectedPlayers.some(
      (p) =>
        p.contactPhoneNumber === player.contactPhoneNumber &&
        p.contactName === player.contactName
    );
  };

  // Safely extract the preferToPlayWith array from userDetails
  const preferToPlayWith = Array.isArray(userDetails?.playerDetails?.preferToPlayWith)
    ? userDetails.playerDetails.preferToPlayWith
    : [];

  const preferredPlayersAsContacts: Contact[] = preferToPlayWith.map(
    (player: any, index: number) => {
      const name = player?.contactName || player?.name || `Preferred ${index + 1}`;
      const phone = normalizePhoneNumber(
        player?.contactPhoneNumber || player?.phoneNumber || `preferred-${index}`
      );
      return { contactName: String(name), contactPhoneNumber: String(phone) };
    }
  );

  // Convert registered players to Contact objects
  const registeredPlayersAsContacts: Contact[] = (registeredPlayers || []).map(
    (player) => ({
      contactName: player.name || '',
      contactPhoneNumber:
        player.phoneNumber || player.id || `registered-${player.id}`,
    })
  );

  useEffect(() => {
    if (visible) {
      setTempSelectedPlayers(selectedPlayers);
    } else {
      setTempSelectedPlayers([]);
      setTempSelectedGroupIds([]);
    }
  }, [visible, selectedPlayers]); 

  const q = searchQuery.trim().toLowerCase();

  const filteredPreferredPlayers = preferredPlayersAsContacts.filter((p) => {
    const name = p.contactName?.toLowerCase() ?? '';
    const phone = p.contactPhoneNumber?.toLowerCase() ?? '';
    return name.includes(q) || phone.includes(q);
  });

  const filteredRegisteredPlayers = registeredPlayersAsContacts.filter((p) => {
    const name = p.contactName?.toLowerCase() ?? '';
    const phone = (p.contactPhoneNumber ?? '').toString().toLowerCase();
    return name.includes(q) || phone.includes(q);
  });

  const filteredContacts = deviceContacts.filter((c) => {
    const name = c.contactName?.toLowerCase() ?? '';
    const phone = (c.contactPhoneNumber ?? '').toLowerCase();
    return name.includes(q) || phone.includes(q);
  }); 

  const normalizedGroups: Group[] = (groupsData || []).map((item: any, i: number) => {
    const group = item.group ?? {};
    return {
      id: group.id?.toString?.() ?? `${i}`,
      groupName: group.name ?? 'Unnamed Group',
      members: Array.isArray(group.members) ? group.members : [],
      membersCount: Array.isArray(group.members) ? group.members.length : 0,
    };
  });  
  
  const filteredGroups = normalizedGroups.filter((g) =>
    (g.groupName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );  

  // Combine and filter all players
  const anyFiltered =
    filteredRegisteredPlayers.length > 0 ||
    filteredPreferredPlayers.length > 0 ||
    filteredContacts.length > 0 ||
    filteredGroups.length > 0;


  const isGroupSelected = (group: Group) => tempSelectedGroupIds.includes(group.id);

  const handleToggleGroup = (group: Group) => {
    if (!group?.id) return;
  
    const isAlreadySelected = tempSelectedGroupIds.includes(group.id);
  
    if (isAlreadySelected) {
      // Remove group ID
      setTempSelectedGroupIds((prev) => prev.filter((id) => id !== group.id));
  
      // Remove group members from selected players
      setTempSelectedPlayers((prev) =>
        prev.filter(
          (p) =>
            !group.members.some(
              (m) =>
                m.phoneNumber === p.contactPhoneNumber &&
                m.name === p.contactName
            )
        )
      );
    } else {
      // Add group ID
      setTempSelectedGroupIds((prev) => [...prev, group.id]);
  
      // ✅ Normalize members to Contact[], but skip current user
      const incoming: Contact[] = group.members
        .filter((m) => m.name !== user?.username) // exclude current user
        .map((m) => ({
          contactName: m.name || "Unknown",
          contactPhoneNumber: m.phoneNumber || "",
        }));
  
      // De-dupe based on phoneNumber + name
      setTempSelectedPlayers((prev) => {
        const seen = new Set(
          prev.map((p) => p.contactPhoneNumber || p.contactName)
        );
        return [
          ...prev,
          ...incoming.filter((p) => {
            const key = p.contactPhoneNumber || p.contactName;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          }),
        ];
      });
    }
  };    

  const renderPlayer = (player: Contact, index: number, source?: string) => (
    <TouchableOpacity
      key={`${player.contactPhoneNumber || index}-${index}`}
      style={styles.playerItem}
      onPress={() => handleTogglePlayer(player)}
      activeOpacity={0.7}
    >
      <View style={styles.playerInfo}>
        <RNText style={styles.playerName}>
          {player.contactName || 'Unknown'}
        </RNText>
        <RNText style={styles.playerPhone}>
          {source || player.contactPhoneNumber}
        </RNText>
      </View>
      <Checkbox
        status={isPlayerSelected(player) ? 'checked' : 'unchecked'}
        onPress={() => handleTogglePlayer(player)}
        color="#2C7E88"
      />
    </TouchableOpacity>
  );  

  const renderGroup = (group: Group, index: number) => (
    <TouchableOpacity
      key={`${group.id || index}-${index}`}
      style={styles.playerItem}
      onPress={() => handleToggleGroup(group)}
      activeOpacity={0.7}
    >
      <View style={styles.playerInfo}>
        <RNText style={styles.playerName}>
          {group.groupName || 'Unnamed Group'}
        </RNText>
        <RNText style={styles.playerPhone}>
          {group.membersCount > 0 ? `${group.membersCount} members` : 'No members'}
        </RNText>
      </View>
      <Checkbox
        status={isGroupSelected(group) ? 'checked' : 'unchecked'}
        onPress={() => handleToggleGroup(group)}
        color="#2C7E88"
      />
    </TouchableOpacity>
  );  
  
  const isLoading = userStatus === 'loading' || registeredStatus === 'loading';
  const hasError = userStatus === 'error' || registeredStatus === 'error';

  return (
    <Modal
      animationType='slide'
      transparent={false}
      visible={visible}
      onRequestClose={handleCancel}
      presentationStyle='fullScreen'
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <Icon name='close' size={24} color='#333' />
          </TouchableOpacity>
          <RNText style={styles.headerTitle}>Select Players</RNText>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder='Search players...'
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
          />
        </View>

        {/* Chips Row */}
        <View style={styles.chipContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {chips.map((chip) => (
              <Chip
                key={chip.key}
                selected={activeChip === chip.key}
                onPress={() => setActiveChip(chip.key as any)}
                style={[
                  styles.chip,
                  activeChip === chip.key && styles.activeChip,
                ]}
                textStyle={[
                  styles.chipText,
                  activeChip === chip.key && styles.activeChipText,
                ]}
              >
                {chip.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size='large' color='#2C7E88' />
              <RNText style={styles.loadingText}>Loading players...</RNText>
            </View>
          ) : hasError ? (
            <View style={styles.centerContent}>
              <Icon name='error-outline' size={48} color='#ff6b6b' />
              <RNText style={styles.errorText}>Failed to load players</RNText>
              <RNText style={styles.errorSubtext}>
                Please check your connection and try again
              </RNText>
            </View>
          ) : !anyFiltered ? (
            <View style={styles.centerContent}>
              <Icon name='search-off' size={48} color='#999' />
              <RNText style={styles.emptyText}>No players found</RNText>
              <RNText style={styles.emptySubtext}>Try adjusting your search</RNText>
            </View>
          ) : (
            <>
              {activeChip === 'registered' && filteredRegisteredPlayers.length > 0 && (
                <View style={styles.section}>
                  <RNText style={styles.sectionTitle}>REGISTERED PLAYERS</RNText>
                  {filteredRegisteredPlayers.map((player, index) =>
                    renderPlayer(player, index)
                  )}
                </View>
              )}
              {/* Placeholder for other chips */}
              {activeChip === 'selected' && (
                tempSelectedPlayers.length > 0 ? (
                  <View style={styles.section}>
                    <RNText style={styles.sectionTitle}>SELECTED PLAYERS</RNText>
                    {tempSelectedPlayers.map((player, index) =>
                      renderPlayer(player, index, 'selected')
                    )}
                  </View>
                ) : (
                  <View style={styles.centerContent}>
                    <RNText style={styles.emptyText}>No players selected yet</RNText>
                  </View>
                )
              )}
              {activeChip === 'preferred' && (
                filteredPreferredPlayers.length > 0 ? (
                  <View style={styles.section}>
                    <RNText style={styles.sectionTitle}>PREFERRED PLAYERS</RNText>
                    {filteredPreferredPlayers.map((player, index) =>
                      renderPlayer(player, index)
                    )}
                  </View>
                ) : (
                  <View style={styles.centerContent}>
                    <RNText style={styles.emptyText}>No preferred players found</RNText>
                  </View>
                )
              )}
                {activeChip === 'contacts' && (
                  loadingContacts ? (
                    <View style={styles.centerContent}>
                      <ActivityIndicator size="large" color="#2C7E88" />
                      <RNText style={styles.loadingText}>Loading contacts...</RNText>
                    </View>
                  ) : filteredContacts.length > 0 ? (
                    <View style={styles.section}>
                      <RNText style={styles.sectionTitle}>CONTACTS</RNText>
                      {filteredContacts.map((contact, index) =>
                        renderPlayer(contact, index)
                      )}
                    </View>
                  ) : (
                    <View style={styles.centerContent}>
                      <RNText style={styles.emptyText}>No contacts found</RNText>
                    </View>
                  )
                )}
              {activeChip === 'groups' && (
                groupsStatus === 'loading' ? (
                  <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#2C7E88" />
                    <RNText style={styles.loadingText}>Loading groups…</RNText>
                  </View>
                ) : groupsStatus === 'success' && filteredGroups.length > 0 ? (
                  <View style={styles.section}>
                    <RNText style={styles.sectionTitle}>GROUPS</RNText>
                    {filteredGroups.map((group, index) => renderGroup(group, index))}
                  </View>
                ) : (
                  <View style={styles.centerContent}>
                    <RNText style={styles.emptyText}>
                      {groupsStatus === 'success' ? 'No groups found' : 'Unable to load groups'}
                    </RNText>
                  </View>
                )
              )}
            </>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.selectedInfo}>
            <RNText style={styles.selectedCount}>
              {tempSelectedPlayers.length} player
              {tempSelectedPlayers.length !== 1 ? 's' : ''} selected
            </RNText>
          </View>
          <Button
            mode='contained'
            onPress={handleSave}
            style={styles.addButton}
            labelStyle={styles.addButtonLabel}
            contentStyle={styles.addButtonContent}
          >
            Add Players
          </Button>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    backgroundColor: '#f5f5f5',
    elevation: 0,
    borderRadius: 10,
  },
  searchInput: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
    color: '#ff6b6b',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
    color: '#999',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  playerInfo: {
    flex: 1,
    marginRight: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  playerPhone: {
    fontSize: 14,
    color: '#666',
  },
  loadMoreButton: {
    alignSelf: 'center',
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  loadMoreText: {
    fontSize: 16,
    color: '#2C7E88',
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  selectedInfo: {
    marginBottom: 12,
  },
  selectedCount: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: "#2C7E88",
    borderRadius: 20,
  },
  activeChip: {
    backgroundColor: '#2C7E88',
  },
  chipText: {
    color: '#333',
    fontWeight: '500',
  },
  activeChipText: {
    color: '#fff',
  },  
  addButton: {
    borderRadius: 8,
    backgroundColor: '#2C7E88',
  },
  addButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonContent: {
    paddingVertical: 8,
  },
});

export default PreferredPlayersModal;
