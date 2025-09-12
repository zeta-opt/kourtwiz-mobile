// components/home-page/PlayerDetailsModal.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  players: { name: string; status: string }[];
  inviteeName: string | null;
}

const PlayerDetailsModal: React.FC<Props> = ({ players,inviteeName  }) => {
  const getColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACCEPTED': return 'green';
      case 'PENDING': return 'orange';
      case 'DECLINED': return 'red';
      default: return 'gray';
    }
  };

  const getIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACCEPTED': return 'check-circle';
      case 'PENDING': return 'clock';
      case 'DECLINED': return 'close-circle';
      default: return 'minus-circle';
    }
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.title}>Players</Text>
      {inviteeName && (
        <View style={styles.playerRow}>
          <Text style={styles.playerName}>
            {inviteeName} (Invitee)
          </Text>
          <View style={styles.statusContainer}>
            <MaterialCommunityIcons
              name={getIcon("ACCEPTED")}
              size={20}
              color={getColor("ACCEPTED")}
            />
            <Text style={[styles.statusText, { color: getColor("ACCEPTED") }]}>
              ACCEPTED
            </Text>
          </View>
        </View>
      )}
      {players.map((player, index) => (
        <View key={index} style={styles.playerRow}>
          <Text style={styles.playerName}>{player.name}</Text>
          <View style={styles.statusContainer}>
            <MaterialCommunityIcons name={getIcon(player.status)} size={20} color={getColor(player.status)} />
            <Text style={[styles.statusText, { color: getColor(player.status) }]}>{player.status}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    paddingBottom: 4,
  },
  playerName: {
    fontSize: 16,
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
    inviteeContainer: {
    marginBottom: 12,
  },
  inviteeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
  },
});

export default PlayerDetailsModal;
