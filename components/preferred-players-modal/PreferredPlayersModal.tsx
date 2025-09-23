import { useGetGroupsByPhoneNumber } from '@/hooks/apis/groups/useGetGroups';
import { useGetRegisteredPlayers } from '@/hooks/apis/player-finder/useGetRegisteredPlayers';
import { useGetUserDetails } from '@/hooks/apis/player-finder/useGetUserDetails';
import { RootState } from '@/store';
import { MaterialIcons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { router, usePathname } from 'expo-router';
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
import { Button, Checkbox, Chip, Searchbar } from 'react-native-paper';
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
  // { key: 'registered', label: 'Players Nearby' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'groups', label: 'Groups' },
];

const PreferredPlayersModal: React.FC<PreferredPlayersModalProps> = ({
  visible,
  onClose,
  onSelectPlayers,
  selectedPlayers,
}) => {
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState('');
  const [deviceContacts, setDeviceContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Normalizers
  const normalizePhoneNumber = (phone = '') =>
    String(phone || '')
      .trim()
      .replace(/[^\d+]/g, '') // keep digits and '+'
      .replace(/(?!^)\+/g, ''); // remove '+' if not at start

  const normalizeName = (n = '') =>
    String(n || '')
      .trim()
      .toLowerCase();

  const [tempSelectedPlayers, setTempSelectedPlayers] = useState<Contact[]>([]);
  // group ids for which "select all" was used or to keep track as selected groups
  const [tempSelectedGroupIds, setTempSelectedGroupIds] = useState<string[]>(
    []
  );
  // expanded groups for dropdown checklist UI
  const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>([]);
  const [activeChip, setActiveChip] = useState<
    'selected' | 'contacts' | 'groups'
  >('contacts');

  // Current user
  const user = useSelector((state: RootState) => state.auth?.user);
  const userId = user?.userId;
  const currentUserPhone = normalizePhoneNumber(user?.phoneNumber || '');
  const currentUserName = normalizeName(user?.name || '');

  const {
    getGroups,
    data: groupsData,
    status: groupsStatus,
  } = useGetGroupsByPhoneNumber();

  interface Group {
    id: string;
    groupName: string;
    members: { name?: string; phoneNumber?: string }[];
    membersCount: number;
  }

  /* --------- Load Device Contacts (exclude current user if name OR phone matches) --------- */
  const loadDeviceContacts = async () => {
    setLoadingContacts(true);
    try {
      const { status } = await Contacts.getPermissionsAsync();
      if (status !== 'granted') {
        setLoadingContacts(false);
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        sort: Contacts.SortTypes.FirstName,
      });

      const transformed: Contact[] = (data || [])
        .filter((c) => c.name && c.phoneNumbers?.length)
        .map((c) => ({
          contactName: c.name,
          contactPhoneNumber: normalizePhoneNumber(
            c.phoneNumbers?.[0]?.number ?? c.id ?? ''
          ),
        }))
        .filter((c) => {
          const nameMatches = normalizeName(c.contactName) === currentUserName;
          const phoneMatches =
            normalizePhoneNumber(c.contactPhoneNumber) === currentUserPhone;
          // EXCLUDE if EITHER name or phone matches current user
          return !(nameMatches || phoneMatches);
        });

      setDeviceContacts(transformed);
    } catch (err) {
      console.error('Error loading contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    if (visible) loadDeviceContacts();
  }, [visible]);

  useEffect(() => {
    if (user?.phoneNumber) {
      getGroups({ phoneNumber: user.phoneNumber });
    }
  }, [user?.phoneNumber]);

  // userDetails for preferred players
  const { data: userDetails, status: userStatus } = useGetUserDetails({
    userId,
    enabled: visible,
  });

  // registered players
  const { data: registeredPlayers, status: registeredStatus } =
    useGetRegisteredPlayers({ enabled: visible });

  useEffect(() => {
    if (visible) setTempSelectedPlayers(selectedPlayers || []);
    else {
      setTempSelectedPlayers([]);
      setTempSelectedGroupIds([]);
      setExpandedGroupIds([]);
    }
  }, [visible, selectedPlayers]);

  /* --------- Toggle single player (exclude current user if name OR phone matches) --------- */
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
      return;
    }

    // Exclude current user if name OR phone matches
    const nameMatch = normalizeName(player.contactName) === currentUserName;
    const phoneMatch =
      normalizePhoneNumber(player.contactPhoneNumber) === currentUserPhone;
    if (nameMatch || phoneMatch) return;

    setTempSelectedPlayers((prev) => [...prev, player]);
  };

  /* --------- Save - final filter excludes current user (if name OR phone matches) --------- */
  const handleSave = () => {
    const filtered = tempSelectedPlayers.filter((p) => {
      const nameMatches = normalizeName(p.contactName) === currentUserName;
      const phoneMatches =
        normalizePhoneNumber(p.contactPhoneNumber) === currentUserPhone;
      return !(nameMatches || phoneMatches);
    });

    onSelectPlayers(filtered);
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedPlayers(selectedPlayers);
    onClose();
  };

  const isPlayerSelected = (player: Contact) =>
    tempSelectedPlayers.some(
      (p) =>
        normalizePhoneNumber(p.contactPhoneNumber) ===
          normalizePhoneNumber(player.contactPhoneNumber) &&
        normalizeName(p.contactName) === normalizeName(player.contactName)
    );

  /* --------- Preferred players from API (normalize + exclude current user by name OR phone) --------- */
  const normalizedCurrentName = normalizeName(currentUserName);
  const normalizedCurrentPhone = normalizePhoneNumber(currentUserPhone);

  const preferToPlayWith = Array.isArray(
    userDetails?.playerDetails?.preferToPlayWith
  )
    ? userDetails.playerDetails.preferToPlayWith
    : [];

  const preferredPlayersAsContacts: Contact[] = preferToPlayWith
    .map(
      (player: any, index: number): Contact & { _normalizedPhone: string } => {
        const name = player?.contactName || `Preferred ${index + 1}`;
        const phoneRaw = player?.contactPhoneNumber || `preferred-${index}`;
        return {
          contactName: name,
          contactPhoneNumber: phoneRaw,
          _normalizedPhone: normalizePhoneNumber(phoneRaw),
        };
      }
    )
    .filter((p: Contact & { _normalizedPhone: string }) => {
      // exclude current user (by phone only)
      return p._normalizedPhone !== normalizedCurrentPhone;
    })
    .filter(
      (
        p: Contact & { _normalizedPhone: string },
        index: number,
        arr: Contact & { _normalizedPhone: string }[]
      ) =>
        index ===
        arr.findIndex((q) => q._normalizedPhone === p._normalizedPhone)
    )
    .map(
      ({ contactName, contactPhoneNumber }: Contact): Contact => ({
        contactName,
        contactPhoneNumber,
      })
    );

  /* --------- Registered players (normalize + exclude current user by OR) --------- */
  const registeredPlayersAsContacts: Contact[] = (registeredPlayers || [])
    .map((player) => ({
      contactName: player?.name || '',
      contactPhoneNumber:
        player?.phoneNumber || player?.id || `registered-${player?.id}`,
    }))
    .filter((p) => {
      const nameMatches = normalizeName(p.contactName) === currentUserName;
      const phoneMatches =
        normalizePhoneNumber(p.contactPhoneNumber) === currentUserPhone;
      return !(nameMatches || phoneMatches);
    });

  /* --------- Searching and filtering ---------- */
  const q = searchQuery.trim().toLowerCase();

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

  /* --------- Groups (normalized mapping) ---------- */
  const normalizedGroups: Group[] = (groupsData || []).map(
    (item: any, i: number) => {
      const group = item.group ?? {};
      return {
        id: group.id?.toString?.() ?? `${i}`,
        groupName: group.name ?? 'Unnamed Group',
        members: Array.isArray(group.members) ? group.members : [],
        membersCount: Array.isArray(group.members) ? group.members.length : 0,
      };
    }
  );

  // Insert preferred players as a synthetic group at the top of groups list
  const preferredAsGroup: Group | null =
    preferredPlayersAsContacts.length > 0
      ? {
          id: 'preferred', // synthetic id
          groupName: 'Preferred Players',
          members: preferredPlayersAsContacts.map((c) => ({
            name: c.contactName,
            phoneNumber: c.contactPhoneNumber,
          })),
          membersCount: preferredPlayersAsContacts.length,
        }
      : null;

  const allGroupsWithPreferred: Group[] = preferredAsGroup
    ? [preferredAsGroup, ...normalizedGroups]
    : normalizedGroups;

  const filteredGroups = allGroupsWithPreferred.filter((g) =>
    (g.groupName || '').toLowerCase().includes(q)
  );

  const anyFiltered =
    filteredRegisteredPlayers.length > 0 ||
    filteredContacts.length > 0 ||
    filteredGroups.length > 0;

  /* --------- Group helpers ---------- */

  const isGroupExpanded = (group: Group) => expandedGroupIds.includes(group.id);

  const toggleGroupExpanded = (group: Group) => {
    setExpandedGroupIds((prev) =>
      prev.includes(group.id)
        ? prev.filter((id) => id !== group.id)
        : [...prev, group.id]
    );
  };

  // compute whether all non-current-user members of the group are currently selected
  const isGroupAllSelected = (group: Group) => {
    const members = (group.members || []).filter((m) => {
      const nameMatches = normalizeName(m.name || '') === currentUserName;
      const phoneMatches =
        normalizePhoneNumber(m.phoneNumber || '') === currentUserPhone;
      return !(nameMatches || phoneMatches); // exclude current user
    });

    if (members.length === 0) return false;

    return members.every((m) => {
      const contact: Contact = {
        contactName: String(m.name || 'Unknown'),
        contactPhoneNumber: String(m.phoneNumber || ''),
      };
      return isPlayerSelected(contact);
    });
  };

  // toggle select all for a group: either add all members or remove them
  const handleToggleSelectAllForGroup = (group: Group) => {
    const members = (group.members || []).map((m) => ({
      contactName: m.name || 'Unknown',
      contactPhoneNumber: m.phoneNumber || '',
    }));

    // exclude current user defensively
    const incoming = members.filter((p) => {
      const nameMatches = normalizeName(p.contactName) === currentUserName;
      const phoneMatches =
        normalizePhoneNumber(p.contactPhoneNumber) === currentUserPhone;
      return !(nameMatches || phoneMatches);
    });

    const groupAllSelected = isGroupAllSelected(group);

    if (groupAllSelected) {
      // Deselect all members from this group
      setTempSelectedPlayers((prev) =>
        prev.filter(
          (p) =>
            !incoming.some((m) => {
              const pmPhone = normalizePhoneNumber(m.contactPhoneNumber || '');
              const pmName = normalizeName(m.contactName || '');
              const pPhone = normalizePhoneNumber(p.contactPhoneNumber || '');
              const pName = normalizeName(p.contactName || '');
              return pmPhone === pPhone || pmName === pName;
            })
        )
      );
      // remove group id from selected group ids
      setTempSelectedGroupIds((prev) => prev.filter((id) => id !== group.id));
      return;
    }

    // SELECT all: add all incoming to tempSelectedPlayers (dedupe)
    setTempSelectedPlayers((prev) => {
      const seen = new Set(
        prev.map(
          (p) =>
            `${normalizePhoneNumber(p.contactPhoneNumber)}|${normalizeName(
              p.contactName
            )}`
        )
      );

      const toAdd = incoming.filter((p) => {
        const key = `${normalizePhoneNumber(
          p.contactPhoneNumber
        )}|${normalizeName(p.contactName)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      return [...prev, ...toAdd];
    });

    // mark group as selected via group id
    setTempSelectedGroupIds((prev) =>
      prev.includes(group.id) ? prev : [...prev, group.id]
    );
  };

  // toggle a single member inside a group
  const handleToggleMemberInGroup = (member: {
    name?: string;
    phoneNumber?: string;
  }) => {
    const contact: Contact = {
      contactName: member.name || 'Unknown',
      contactPhoneNumber: member.phoneNumber || '',
    };
    handleTogglePlayer(contact);
  };

  /* --------- Render helpers (unchanged styles assumed) ---------- */
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
        color='#2C7E88'
      />
    </TouchableOpacity>
  );

  // group dropdown checklist render
  const renderGroup = (group: Group, index: number) => {
    const groupAllSelected = isGroupAllSelected(group);

    return (
      <View key={`${group.id || index}-${index}`} style={{ marginBottom: 12 }}>
        <TouchableOpacity
          style={styles.playerItem}
          onPress={() => toggleGroupExpanded(group)}
          activeOpacity={0.7}
        >
          <View style={styles.playerInfo}>
            <RNText style={styles.playerName}>
              {group.groupName || 'Unnamed Group'}
            </RNText>
            <RNText style={styles.playerPhone}>
              {group.membersCount > 0
                ? `${group.membersCount} members`
                : 'No members'}
            </RNText>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Select all / Deselect all button */}
            <TouchableOpacity
              onPress={() => handleToggleSelectAllForGroup(group)}
              style={{
                marginRight: 8,
                paddingHorizontal: 8,
                paddingVertical: 6,
              }}
            >
              <RNText style={{ fontSize: 13 }}>
                {groupAllSelected ? 'Deselect all' : 'Select all'}
              </RNText>
            </TouchableOpacity>

            {/* Collapse/expand indicator */}
            <MaterialIcons
              name={
                isGroupExpanded(group)
                  ? 'keyboard-arrow-up'
                  : 'keyboard-arrow-down'
              }
              size={24}
              color='#333'
            />
          </View>
        </TouchableOpacity>

        {/* Expanded members list */}
        {isGroupExpanded(group) && (group.members || []).length > 0 && (
          <View style={{ paddingLeft: 16, marginTop: 8 }}>
            {(group.members || [])
              .filter((m) => {
                // exclude current user defensively from listing
                const nameMatches =
                  normalizeName(m.name || '') === currentUserName;
                const phoneMatches =
                  normalizePhoneNumber(m.phoneNumber || '') ===
                  currentUserPhone;
                return !(nameMatches || phoneMatches);
              })
              .map((member, mi) => {
                const contact: Contact = {
                  contactName: member.name || 'Unknown',
                  contactPhoneNumber: member.phoneNumber || '',
                };
                return (
                  <TouchableOpacity
                    key={`${group.id}-member-${mi}`}
                    style={styles.playerItem}
                    onPress={() => handleToggleMemberInGroup(member)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.playerInfo}>
                      <RNText style={styles.playerName}>
                        {contact.contactName}
                      </RNText>
                      <RNText style={styles.playerPhone}>
                        {contact.contactPhoneNumber}
                      </RNText>
                    </View>
                    <Checkbox
                      status={
                        isPlayerSelected(contact) ? 'checked' : 'unchecked'
                      }
                      onPress={() => handleToggleMemberInGroup(member)}
                      color='#2C7E88'
                    />
                  </TouchableOpacity>
                );
              })}
          </View>
        )}
      </View>
    );
  };

  const isLoading = userStatus === 'loading' || registeredStatus === 'loading';
  const hasError = userStatus === 'error' || registeredStatus === 'error';

  /* ---------- RENDER ---------- */
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
            <MaterialIcons name='close' size={24} color='#333' />
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
              <MaterialIcons name='error-outline' size={48} color='#ff6b6b' />
              <RNText style={styles.errorText}>Failed to load players</RNText>
              <RNText style={styles.errorSubtext}>
                Please check your connection and try again
              </RNText>
            </View>
          ) : !anyFiltered ? (
            <View style={styles.centerContent}>
              <MaterialIcons name='search-off' size={48} color='#999' />
              <RNText style={styles.emptyText}>No players found</RNText>
              <RNText style={styles.emptySubtext}>
                Try adjusting your search
              </RNText>
            </View>
          ) : (
            <>
              {/* {activeChip === 'registered' &&
                filteredRegisteredPlayers.length > 0 && (
                  <View style={styles.section}>
                    <RNText style={styles.sectionTitle}>
                      PLAYERS NEARBY
                    </RNText>
                    {filteredRegisteredPlayers.map((player, index) =>
                      renderPlayer(player, index)
                    )}
                  </View>
                )} */}
              {/* Placeholder for other chips */}
              {activeChip === 'selected' &&
                (tempSelectedPlayers.length > 0 ? (
                  <View style={styles.section}>
                    <RNText style={styles.sectionTitle}>
                      SELECTED PLAYERS
                    </RNText>
                    {tempSelectedPlayers.map((player, index) =>
                      renderPlayer(player, index)
                    )}
                  </View>
                ) : (
                  <View style={styles.centerContent}>
                    <RNText style={styles.emptyText}>
                      No players selected yet
                    </RNText>
                  </View>
                ))}

              {activeChip === 'contacts' &&
                (loadingContacts ? (
                  <View style={styles.centerContent}>
                    <ActivityIndicator size='large' color='#2C7E88' />
                    <RNText style={styles.loadingText}>
                      Loading contacts...
                    </RNText>
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
                ))}

              {activeChip === 'groups' &&
                (groupsStatus === 'loading' ? (
                  <View style={styles.centerContent}>
                    <ActivityIndicator size='large' color='#2C7E88' />
                    <RNText style={styles.loadingText}>Loading groups…</RNText>
                  </View>
                ) : groupsStatus === 'success' && filteredGroups.length > 0 ? (
                  <View style={styles.section}>
                    <RNText style={styles.sectionTitle}>GROUPS</RNText>
                    {filteredGroups.map((group, index) =>
                      renderGroup(group, index)
                    )}
                  </View>
                ) : (
                  <View style={styles.centerContent}>
                    <RNText style={styles.emptyText}>
                      {groupsStatus === 'success'
                        ? 'No groups found'
                        : 'Unable to load groups'}
                    </RNText>
                  </View>
                ))}
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

          <>
            {/* Add Players button (always visible) */}
            <Button
              mode='contained'
              onPress={handleSave}
              style={styles.addButton}
              labelStyle={styles.addButtonLabel}
              contentStyle={styles.addButtonContent}
            >
              Add Players
            </Button>

            {/* Conditionally render Create New Group button */}
            {!pathname.includes('create-group') && (
              <Button
                mode='contained'
                onPress={() => router.replace('/(authenticated)/create-group')}
                style={styles.groupButton}
                labelStyle={styles.groupButtonLabel}
                contentStyle={styles.groupButtonContent}
                textColor='#fff'
              >
                Create New Group
              </Button>
            )}
          </>
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
    color: '#000',
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
    borderColor: '#2C7E88',
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
  groupButton: {
    borderRadius: 30,
    backgroundColor: '#2C7E88',
    marginTop: 10,
  },
  groupButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  groupButtonContent: {
    paddingVertical: 4,
  },
  addButton: {
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2C7E88',
  },
  addButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C7E88',
  },
  addButtonContent: {
    paddingVertical: 4,
  },
});

export default PreferredPlayersModal;
