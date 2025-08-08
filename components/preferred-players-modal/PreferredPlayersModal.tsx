import { useGetRegisteredPlayers } from '@/hooks/apis/player-finder/useGetRegisteredPlayers';
import { useGetUserDetails } from '@/hooks/apis/player-finder/useGetUserDetails';
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
import { Button, Checkbox, Searchbar } from 'react-native-paper';
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

const PreferredPlayersModal: React.FC<PreferredPlayersModalProps> = ({
  visible,
  onClose,
  onSelectPlayers,
  selectedPlayers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelectedPlayers, setTempSelectedPlayers] = useState<Contact[]>([]);

  // Get user ID from Redux store
  const userId = useSelector((state: RootState) => state.auth?.user?.id || '');

  // Fetch user details for preferred players
  const { preferredPlayers, status: userStatus } = useGetUserDetails({
    userId,
    enabled: visible,
  });

  // Fetch registered players
  const {
    data: registeredPlayers,
    status: registeredStatus,
    hasMore,
    loadMore,
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
    onSelectPlayers(tempSelectedPlayers);
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

  // Convert preferred players (strings) to Contact objects
  const preferredPlayersAsContacts: Contact[] = (preferredPlayers || []).map(
    (name, index) => ({
      contactName: name,
      contactPhoneNumber: `preferred-${index}`,
    })
  );

  // Convert registered players to Contact objects
  const registeredPlayersAsContacts: Contact[] = (registeredPlayers || []).map(
    (player) => ({
      contactName: player.name || '',
      contactPhoneNumber:
        player.phoneNumber || player.id || `registered-${player.id}`,
    })
  );

  // Combine and filter all players
  const allPlayers = [
    ...preferredPlayersAsContacts,
    ...registeredPlayersAsContacts,
  ];

  const filteredPlayers = allPlayers.filter(
    (player) =>
      player.contactName &&
      player.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const preferredFilteredPlayers = filteredPlayers.filter(
    (p) => p.contactPhoneNumber && p.contactPhoneNumber.startsWith('preferred-')
  );

  const registeredFilteredPlayers = filteredPlayers.filter(
    (p) =>
      !p.contactPhoneNumber || !p.contactPhoneNumber.startsWith('preferred-')
  );

  const renderPlayer = (player: Contact, index: number) => {
    const isPreferred =
      player.contactPhoneNumber &&
      player.contactPhoneNumber.startsWith('preferred-');

    return (
      <TouchableOpacity
        key={`${player.contactPhoneNumber || index}-${index}`}
        style={styles.playerItem}
        onPress={() => handleTogglePlayer(player)}
        activeOpacity={0.7}
      >
        <View style={styles.playerInfo}>
          <RNText style={styles.playerName}>
            {player.contactName || 'Unknown Player'}
          </RNText>
          <RNText style={styles.playerPhone}>
            {isPreferred ? 'Preferred Player' : player.contactPhoneNumber || ''}
          </RNText>
        </View>
        <Checkbox
          status={isPlayerSelected(player) ? 'checked' : 'unchecked'}
          onPress={() => handleTogglePlayer(player)}
          color='#2C7E88'
        />
      </TouchableOpacity>
    );
  };

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
          ) : filteredPlayers.length === 0 ? (
            <View style={styles.centerContent}>
              <Icon name='search-off' size={48} color='#999' />
              <RNText style={styles.emptyText}>No players found</RNText>
              <RNText style={styles.emptySubtext}>
                Try adjusting your search
              </RNText>
            </View>
          ) : (
            <>
              {/* Preferred Players Section */}
              {preferredFilteredPlayers.length > 0 && (
                <View style={styles.section}>
                  <RNText style={styles.sectionTitle}>PREFERRED PLAYERS</RNText>
                  {preferredFilteredPlayers.map((player, index) =>
                    renderPlayer(player, index)
                  )}
                </View>
              )}

              {/* Registered Players Section */}
              {registeredFilteredPlayers.length > 0 && (
                <View style={styles.section}>
                  <RNText style={styles.sectionTitle}>
                    REGISTERED PLAYERS
                  </RNText>
                  {registeredFilteredPlayers.map((player, index) =>
                    renderPlayer(player, index)
                  )}
                </View>
              )}

              {/* Load More Button */}
              {hasMore && registeredStatus === 'success' && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMore}
                >
                  <RNText style={styles.loadMoreText}>Load More Players</RNText>
                </TouchableOpacity>
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
