import { RootState } from '@/store';
import {
  closeSelectContactsModal,
  openPlayerFinderModal,
} from '@/store/uiSlice';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import {
  Button,
  Checkbox,
  Divider,
  Modal,
  Portal,
  Text,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

type Contact = {
  contactName: string;
  contactPhoneNumber: string;
};

const ChooseContactsModal = () => {
  const visible = useSelector(
    (state: RootState) => state.ui.selectContactsModal
  );
  const contactList = useSelector(
    (state: RootState) => state.playerFinder.contactList
  );
  const dispatch = useDispatch();

  const [selected, setSelected] = useState<Record<string, Contact>>({});
  const [searchText, setSearchText] = useState('');

  const handleClose = () => {
    dispatch(closeSelectContactsModal());
    dispatch(openPlayerFinderModal());
  };

  const handleSubmit = () => {
    const selectedContacts = Object.values(selected);
    console.log('Submitted contacts:', selectedContacts);
    // Do something with selectedContacts
    handleClose();
  };

  const toggleSelection = (key: string, contact: Contact) => {
    setSelected((prev) => {
      const updated = { ...prev };
      if (updated[key]) {
        delete updated[key];
      } else {
        updated[key] = contact;
      }
      return updated;
    });
  };

  const filteredContacts = contactList.filter((contact: Contact) => {
    const query = searchText.toLowerCase();
    return (
      contact.contactName.toLowerCase().includes(query) ||
      contact.contactPhoneNumber.toLowerCase().includes(query)
    );
  });

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={styles.modalContent}
      >
        <Text style={styles.heading}>Choose preferred contacts</Text>

        {/* 🔍 Search input */}
        <TextInput
          placeholder='Search by name or number'
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />

        {/* 📋 Contact list */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredContacts.length === 0 ? (
            <Text>No matching contacts.</Text>
          ) : (
            filteredContacts.map((contact: Contact, index: number) => {
              const key = `${contact.contactName}_${contact.contactPhoneNumber}`;
              const isChecked = !!selected[key];
              return (
                <View key={key} style={{ marginBottom: 12 }}>
                  <Text style={styles.nameText}>{contact.contactName}</Text>
                  <View style={styles.checkboxRow}>
                    <Checkbox
                      status={isChecked ? 'checked' : 'unchecked'}
                      onPress={() => toggleSelection(key, contact)}
                    />
                    <Text>{contact.contactPhoneNumber}</Text>
                  </View>
                  {index < filteredContacts.length - 1 && (
                    <Divider style={{ marginTop: 8 }} />
                  )}
                </View>
              );
            })
          )}
        </ScrollView>

        {/* ✅ Selected summary */}
        {Object.keys(selected).length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.selectedHeading}>
              Selected ({Object.keys(selected).length}):
            </Text>
            {Object.values(selected).map((contact, idx) => (
              <Text key={idx}>
                • {contact.contactName} - {contact.contactPhoneNumber}
              </Text>
            ))}
          </View>
        )}

        {/* 🚀 Submit button */}
        <Button
          mode='contained'
          onPress={handleSubmit}
          disabled={Object.keys(selected).length === 0}
          style={styles.submitButton}
        >
          Submit
        </Button>
      </Modal>
    </Portal>
  );
};

export default ChooseContactsModal;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    maxHeight: '90%',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scrollArea: {
    maxHeight: 300,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 12,
  },
  submitButton: {
    marginTop: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
});
