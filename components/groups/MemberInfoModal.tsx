import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

type Member = {
    avatar?: string;
    name?: string;
    phoneNumber?: string;
    admin?: boolean;
  };

type Props = {
    visible: boolean;
    onClose: () => void;
    member: Member | null;
  };
const MemberInfoModal: React.FC<Props> = ({ visible, onClose, member }) => {
  if (!member) return null;

  const { avatar, name, phoneNumber, admin } = member;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.initials}>{name?.[0] || '?'}</Text>
            </View>
          )}

          <Text style={styles.name}>{name}</Text>
          <Text style={styles.info}>Phone: {phoneNumber}</Text>
          <Text style={styles.info}>Admin: {admin ? 'Yes' : 'No'}</Text>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default MemberInfoModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  initials: {
    fontSize: 32,
    color: 'white',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  info: {
    fontSize: 16,
    marginBottom: 4,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#257073',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
