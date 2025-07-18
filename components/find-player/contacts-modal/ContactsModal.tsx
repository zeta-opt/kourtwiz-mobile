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
  List,
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

  const renderContact = ({ item }: { item: DeviceContact }) => (
    <List.Item
      title={item.name}
      description={getContactDisplayNumber(item)}
      left={() => (
        <Checkbox
          status={isContactSelected(item) ? 'checked' : 'unchecked'}
          onPress={() => handleToggleContact(item)}
        />
      )}
      style={styles.listItem}
    />
  );
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
          <Text style={styles.selectedCount}>
            {selectedLocalDeviceContacts.length} contact(s) selected
          </Text>
          <View style={styles.buttonRow}>
            <Button
              mode='outlined'
              onPress={handleCancel}
              style={styles.button}
            >
              Cancel
            </Button>
            <Button mode='contained' onPress={handleSave} style={styles.button}>
              Add Selected
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
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
  footer: {
    padding: 16,
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
