import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';

export interface Contact {
  contactName: string;
  contactPhoneNumber: string;
}

interface PreferredPlayersSelectorProps {
  preferredContacts: Contact[];
  onShowPreferredPlayers: () => void;
  onAddContact: () => void;
  onRemovePlayer: (index: number) => void;
}

const PreferredPlayersSelector: React.FC<PreferredPlayersSelectorProps> = ({
  preferredContacts,
  onShowPreferredPlayers,
  onAddContact,
  onRemovePlayer,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
          style={styles.playersBox}
          onPress={onShowPreferredPlayers}
          activeOpacity={0.7}
        >
      <Text variant='titleMedium' style={styles.sectionTitle}>
        Select Players From Groups And Contacts
      </Text>
      </TouchableOpacity>

      <View style={styles.playersBoxContainer}>
        
          
        

        {preferredContacts.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsContainer}
          >
            <View style={styles.chipsRow}>
              {preferredContacts.map((contact, index) => (
                <Chip
                  key={`${contact.contactPhoneNumber}-${index}`}
                  mode='outlined'
                  onClose={() => onRemovePlayer(index)}
                  style={styles.chip}
                  textStyle={styles.chipText}
                >
                  {contact.contactName}
                </Chip>
              ))}
            </View>
          </ScrollView>
        )}

        {/* <TouchableOpacity
          onPress={onAddContact}
          style={styles.addFromContactsLink}
        >
          <Text style={styles.linkText}>Add Player from your Contacts</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: -40,

    marginBottom: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    marginBottom: 4,
    textDecorationLine: 'underline',
    color: '#007AFF',
  },
  playersBoxContainer: {
    marginTop: 8,
  },
  playersBox: {
    height: 48,
    paddingHorizontal: 12,
    justifyContent: 'center',

  },
  selectPlayerText: {
    color: '#999',
    fontSize: 15,
  },
  chipsContainer: {
    marginTop: 12,
    maxHeight: 45,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
  },
  chipText: {
    fontSize: 13,
    color: '#1976d2',
  },
  addFromContactsLink: {
    marginTop: 8,
    paddingVertical: 4,
  },
  linkText: {
    color: '#2C7E88',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});

export default PreferredPlayersSelector;
