import { useGetRegisteredPlayers } from '@/hooks/apis/player-finder/useGetRegisteredPlayers';
import { useGetUserDetails } from '@/hooks/apis/player-finder/useGetUserDetails';
import { RootState } from '@/store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Checkbox,
  Divider,
  IconButton,
  Modal,
  Portal,
  Searchbar,
  Text,
} from 'react-native-paper';
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
  console.log(selectedPlayers, 'selectedPlayers in modal');
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

  // Inside the component body:
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

  const renderPlayer = (player: Contact, index: number) => {
    const isPreferred =
      player.contactPhoneNumber &&
      player.contactPhoneNumber.startsWith('preferred-');

    return (
      <View
        key={`${player.contactPhoneNumber || index}-${index}`}
        style={styles.playerCard}
      >
        <View style={styles.playerContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.playerName}>
              {player.contactName || 'Unknown Player'}
            </Text>
            <Text style={styles.playerSubText}>
              {isPreferred
                ? 'Preferred Player'
                : player.contactPhoneNumber || ''}
            </Text>
          </View>
          <Checkbox
            status={isPlayerSelected(player) ? 'checked' : 'unchecked'}
            onPress={() => handleTogglePlayer(player)}
            color='#2C7E88'
          />
        </View>
      </View>
    );
  };

  const isLoading = userStatus === 'loading' || registeredStatus === 'loading';
  const hasError = userStatus === 'error' || registeredStatus === 'error';

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleCancel}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.header}>
          <Text variant='headlineSmall'>Players</Text>
          <IconButton icon='close' size={24} onPress={handleCancel} />
        </View>

        <Searchbar
          placeholder='Search players...'
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <Divider />

        <ScrollView style={styles.scrollView}>
          {isLoading ? (
            <ActivityIndicator size='large' style={styles.loader} />
          ) : hasError ? (
            <Text style={styles.errorText}>
              Failed to load players. Please try again.
            </Text>
          ) : filteredPlayers.length > 0 ? (
            <>
              {/* Preferred Players Section */}
              {filteredPlayers.some(
                (p) =>
                  p.contactPhoneNumber &&
                  p.contactPhoneNumber.startsWith('preferred-')
              ) && (
                <>
                  <Text style={styles.sectionHeader}>Preferred Players</Text>
                  {filteredPlayers
                    .filter(
                      (p) =>
                        p.contactPhoneNumber &&
                        p.contactPhoneNumber.startsWith('preferred-')
                    )
                    .map((player, index) => renderPlayer(player, index))}
                </>
              )}

              {/* Registered Players Section */}
              {filteredPlayers.some(
                (p) =>
                  !p.contactPhoneNumber ||
                  !p.contactPhoneNumber.startsWith('preferred-')
              ) && (
                <>
                  <Text style={styles.sectionHeader}>Registered Players</Text>
                  {filteredPlayers
                    .filter(
                      (p) =>
                        !p.contactPhoneNumber ||
                        !p.contactPhoneNumber.startsWith('preferred-')
                    )
                    .map((player, index) => renderPlayer(player, index))}
                </>
              )}
            </>
          ) : (
            <Text style={styles.emptyText}>No players found</Text>
          )}

          {hasMore && registeredStatus === 'success' && (
            <Button
              mode='text'
              onPress={loadMore}
              style={styles.loadMoreButton}
              textColor='#2C7E88'
            >
              Load More
            </Button>
          )}
        </ScrollView>

        <Divider />

        <View style={styles.footer}>
          <Button
            mode='contained'
            onPress={handleSave}
            style={styles.addPlayersButton}
            contentStyle={{ paddingVertical: 10 }}
            labelStyle={{ fontSize: 16 }}
          >
            Add Players ({tempSelectedPlayers.length})
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  playerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  playerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  playerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },

  playerSubText: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 16,
    paddingTop: 8,
  },
  searchBar: {
    margin: 16,
    marginTop: 8,
    backgroundColor: '#D9D9D9',
  },
  scrollView: {
    flex: 1,
    minHeight: 300,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  listItem: {
    paddingVertical: 8,
  },

  loader: {
    marginTop: 50,
  },
  loadMoreButton: {
    marginVertical: 16,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 50,
    paddingHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  addPlayersButton: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#2C7E88', // Changed to a more suitable color
  },
  selectedCount: {
    marginBottom: 12,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    minWidth: 80,
  },
});

export default PreferredPlayersModal;
