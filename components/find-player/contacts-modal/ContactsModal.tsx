import * as Contacts from 'expo-contacts';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  View,
} from 'react-native';
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

export interface Contact {
  contactName: string;
  contactPhoneNumber: string;
}

interface DeviceContact {
  id: string;
  name: string;
  phoneNumbers?: {
    number?: string;
    digits?: string;
    label?: string;
  }[];
}

interface ContactsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectContacts: (contacts: Contact[]) => void;
  selectedContacts: Contact[];
}

const ContactsModal: React.FC<ContactsModalProps> = ({
  visible,
  onClose,
  onSelectContacts,
  selectedContacts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceContacts, setDeviceContacts] = useState<DeviceContact[]>([]);
  const [tempSelectedContacts, setTempSelectedContacts] =
    useState<Contact[]>(selectedContacts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadContacts();
      setTempSelectedContacts(selectedContacts);
    }
  }, [visible, selectedContacts]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      // Double-check permission before loading
      const { status } = await Contacts.getPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Contact permission is required to load your contacts.',
          [{ text: 'OK', onPress: () => onClose() }]
        );
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        sort: Contacts.SortTypes.FirstName,
      });

      // Transform expo contacts to our format
      const transformedContacts: DeviceContact[] = data
        .filter((contact) => contact.name) // Only contacts with names
        .map((contact) => ({
          id: contact.id || `contact-${Math.random()}`,
          name: contact.name || 'Unknown',
          phoneNumbers: contact.phoneNumbers,
        }));

      setDeviceContacts(transformedContacts);
    } catch (error: any) {
      console.error('Error loading contacts:', error);

      // Check if it's a permission error
      if (error.message && error.message.includes('permission')) {
        Alert.alert(
          'Permission Error',
          'Unable to access contacts. Please ensure you have granted contact permissions in your device settings.',
          [
            { text: 'Cancel', onPress: () => onClose() },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to load contacts. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getContactDisplayNumber = (contact: DeviceContact): string => {
    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      const firstNumber = contact.phoneNumbers[0];
      return firstNumber.number || firstNumber.digits || 'No number';
    }
    return 'No phone number';
  };

  const convertToAppContact = (deviceContact: DeviceContact): Contact => {
    const phoneNumber =
      deviceContact.phoneNumbers && deviceContact.phoneNumbers.length > 0
        ? deviceContact.phoneNumbers[0].number ||
          deviceContact.phoneNumbers[0].digits ||
          deviceContact.id
        : deviceContact.id;

    return {
      contactName: deviceContact.name,
      contactPhoneNumber: phoneNumber,
    };
  };

  const handleToggleContact = (deviceContact: DeviceContact) => {
    const appContact = convertToAppContact(deviceContact);
    const isSelected = tempSelectedContacts.some(
      (c) => c.contactPhoneNumber === appContact.contactPhoneNumber
    );

    if (isSelected) {
      setTempSelectedContacts((prev) =>
        prev.filter(
          (c) => c.contactPhoneNumber !== appContact.contactPhoneNumber
        )
      );
    } else {
      setTempSelectedContacts((prev) => [...prev, appContact]);
    }
  };

  const isContactSelected = (deviceContact: DeviceContact): boolean => {
    const appContact = convertToAppContact(deviceContact);
    return tempSelectedContacts.some(
      (c) => c.contactPhoneNumber === appContact.contactPhoneNumber
    );
  };

  const handleSave = () => {
    onSelectContacts(tempSelectedContacts);
    onClose();
  };

  const handleCancel = () => {
    setSearchQuery('');
    onClose();
  };

  const filteredContacts = deviceContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContact = ({ item }: { item: DeviceContact }) => {
    const appContact = convertToAppContact(item);
    const isSelected = isContactSelected(item);

    return (
      <View key={item.id} style={styles.contactCard}>
        <View style={styles.contactContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactSubText}>
              {getContactDisplayNumber(item)}
            </Text>
          </View>
          <Checkbox
            status={isSelected ? 'checked' : 'unchecked'}
            onPress={() => handleToggleContact(item)}
          />
        </View>
      </View>
    );
  };

  const selectedLocalDeviceContacts = tempSelectedContacts.filter((c) =>
    deviceContacts.some(
      (d) =>
        getContactDisplayNumber(d) === c.contactPhoneNumber &&
        d.name === c.contactName
    )
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size='large' />
          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      );
    }

    return (
      <>
        <Searchbar
          placeholder='Search contacts...'
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <Divider />

        <FlatList
          data={filteredContacts}
          renderItem={renderContact}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'No contacts found matching your search'
                : 'No contacts available'}
            </Text>
          }
          contentContainerStyle={
            filteredContacts.length === 0
              ? styles.emptyListContainer
              : undefined
          }
        />
      </>
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleCancel}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.header}>
          <Text variant='headlineSmall'>Add from Contacts</Text>
          <IconButton icon='close' size={24} onPress={handleCancel} />
        </View>

        {renderContent()}

        <Divider />

        <View style={styles.footer}>
          <Button
            mode='contained'
            onPress={handleSave}
            buttonColor='#1976d2'
            style={styles.addButton}
            contentStyle={{ paddingVertical: 10 }}
            labelStyle={{ fontSize: 16 }}
          >
            Add Contacts ({selectedLocalDeviceContacts.length})
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
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  addButton: {
    width: '100%',
    borderRadius: 8,
  },

  contactCard: {
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
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  contactSubText: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },

  listItem: {
    paddingVertical: 8,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
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

export default ContactsModal;
