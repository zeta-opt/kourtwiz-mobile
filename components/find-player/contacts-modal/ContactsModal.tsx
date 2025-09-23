import * as Contacts from 'expo-contacts';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
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
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceContacts, setDeviceContacts] = useState<DeviceContact[]>([]);
  const [tempSelectedContacts, setTempSelectedContacts] =
    useState<Contact[]>(selectedContacts);
  const [loading, setLoading] = useState(false);
  const normalizePhoneNumber = (phone: string) => {
    const cleaned = phone
      .trim()
      .replace(/[^\d+]/g, '')
      .replace(/(?!^)\+/g, '');
    return cleaned;
  };

  useEffect(() => {
    if (visible) {
      loadContacts();
      setTempSelectedContacts(selectedContacts);
    }
  }, [visible, selectedContacts]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const { status } = await Contacts.getPermissionsAsync();

      if (status !== 'granted') {
        setPermissionDenied(true);
        setDeviceContacts([]); // clear contacts so screen doesn't try to render them
        return;
      }

      setPermissionDenied(false);

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        sort: Contacts.SortTypes.FirstName,
      });

      const transformedContacts: DeviceContact[] = data
        .filter((contact) => contact.name)
        .map((contact) => ({
          id: contact.id || `contact-${Math.random()}`,
          name: contact.name || 'Unknown',
          phoneNumbers: contact.phoneNumbers,
        }));

      setDeviceContacts(transformedContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      setPermissionDenied(true);
      setDeviceContacts([]);
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
      contactPhoneNumber: normalizePhoneNumber(phoneNumber),
    };
  };

  const handleToggleContact = (deviceContact: DeviceContact) => {
    const appContact = convertToAppContact(deviceContact);
    const isSelected = tempSelectedContacts.some(
      (c) =>
        normalizePhoneNumber(c.contactPhoneNumber) ===
        normalizePhoneNumber(appContact.contactPhoneNumber)
    );

    if (isSelected) {
      setTempSelectedContacts((prev) =>
        prev.filter(
          (c) =>
            normalizePhoneNumber(c.contactPhoneNumber) !==
            normalizePhoneNumber(appContact.contactPhoneNumber)
        )
      );
    } else {
      setTempSelectedContacts((prev) => [...prev, appContact]);
    }
  };

  const isContactSelected = (deviceContact: DeviceContact): boolean => {
    const appContact = convertToAppContact(deviceContact);
    return tempSelectedContacts.some(
      (c) =>
        normalizePhoneNumber(c.contactPhoneNumber) ===
        normalizePhoneNumber(appContact.contactPhoneNumber)
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

  const CustomCheckbox = ({
    isSelected,
    onPress,
  }: {
    isSelected: boolean;
    onPress: () => void;
  }) => (
    <Pressable onPress={onPress} style={styles.customCheckbox}>
      <View
        style={[styles.checkboxBox, isSelected && styles.checkboxBoxSelected]}
      >
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </Pressable>
  );

  console.log(permissionDenied, 'permissionDenied');
  const renderContact = ({ item }: { item: DeviceContact }) => {
    const isSelected = isContactSelected(item);

    return (
      <Pressable
        key={item.id}
        onPress={() => handleToggleContact(item)}
        style={({ pressed }) => [
          styles.contactCard,
          pressed && { backgroundColor: '#f0f0f0' },
        ]}
      >
        <View style={styles.contactContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactSubText}>
              {getContactDisplayNumber(item)}
            </Text>
          </View>
          <CustomCheckbox
            isSelected={isSelected}
            onPress={() => handleToggleContact(item)}
          />
        </View>
      </Pressable>
    );
  };

  const selectedLocalDeviceContacts = tempSelectedContacts.filter((c) =>
    deviceContacts.some(
      (d) =>
        normalizePhoneNumber(getContactDisplayNumber(d)) ===
        normalizePhoneNumber(c.contactPhoneNumber)
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

    if (permissionDenied) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
          }}
        >
          <Text style={{ color: '#000', fontSize: 16 }}>
            Contacts permission is required
          </Text>
          <Button
            mode='contained'
            onPress={() => Linking.openSettings()}
            style={{ marginTop: 12, backgroundColor: '#2C7E88' }}
            textColor='#fff'
          >
            Open Settings
          </Button>
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
          placeholderTextColor='#9F9F9F'
          inputStyle={{ fontSize: 14, color: '#000' }}
          iconColor='#666'
          theme={{
            colors: {
              primary: '#2C7E88',
              text: '#000',
              placeholder: '#9F9F9F',
            },
          }}
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
          <Text style={styles.title} variant='headlineSmall'>
            Contacts
          </Text>
          <IconButton icon='close' size={24} onPress={handleCancel} />
        </View>

        {renderContent()}

        <Divider />

        <View style={styles.footer}>
          <Button
            mode='contained'
            onPress={handleSave}
            buttonColor='#2C7E88'
            style={styles.addButton}
            contentStyle={{ paddingVertical: 10 }}
            labelStyle={{ fontSize: 16 }}
            textColor='#fff'
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
  title: {
    color: '#000',
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
    backgroundColor: '#e5e5e5',
    borderRadius: 8,
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
  customCheckbox: {
    padding: 4,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#999999',
    borderRadius: 4,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxSelected: {
    backgroundColor: '#2C7E88',
    borderColor: '#2C7E88',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
