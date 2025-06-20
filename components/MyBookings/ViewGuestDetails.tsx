import React from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  guestList: { name: string; phoneNumber?: string; email?: string }[];
  guestsPaid?: boolean;
  onPayGuests?: () => void;
  payGuestStatus?: 'idle' | 'loading' | 'error' | 'success';
};

const GuestDetailsModal = ({
  visible,
  onDismiss,
  guestList,
  guestsPaid,
  onPayGuests,
  payGuestStatus,
}: Props) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Guest Details</Text>

          {guestList.length === 0 ? (
            <Text style={styles.noGuests}>No guests added yet.</Text>
          ) : (
            <FlatList
              data={guestList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.guestItem}>
                  <Text style={styles.guestText}>Name: {item.name}</Text>
                  <Text style={styles.guestText}>Mail: {item.email}</Text>
                  <Text style={styles.guestText}>Phone: {item.phoneNumber}</Text>
                </View>
              )}
            />
          )}

          {guestList.length > 0 && (
            guestsPaid ? (
              <View style={styles.paidTag}>
                <Text style={styles.paidText}>Guests Paid</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={onPayGuests}
                style={[styles.payButton, { backgroundColor: '#ff9800', marginTop: 16 }]}
                disabled={payGuestStatus === 'loading'}
              >
                <Text style={styles.closeText}>
                  {payGuestStatus === 'loading' ? 'Paying for Guests...' : 'Pay for Guests'}
                </Text>
              </TouchableOpacity>
            )
          )}

          <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noGuests: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666',
    marginTop: 20,
  },
  guestItem: {
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 6,
  },
  guestText: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 20,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2196f3',
    borderRadius: 6,
  },
  payButton: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  paidTag: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: '#4caf50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  paidText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default GuestDetailsModal;
