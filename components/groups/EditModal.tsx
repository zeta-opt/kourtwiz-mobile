import React, { useState } from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, } from 'react-native';
import { Feather } from '@expo/vector-icons';

type EditModalProps = {
  visible: boolean;
  onClose: () => void;
  groupId: string | undefined;
  userId: string | undefined;
  currentName: string;
  updateGroupName: (params: { groupId: string; requesterUserId: string; newName: string }) => Promise<void>;
  refreshGroup: (params: { groupId: string }) => void;
};

export default function EditModal({
  visible,
  onClose,
  groupId,
  userId,
  currentName,
  updateGroupName,
  refreshGroup,
}: EditModalProps) {
  const [editedGroupName, setEditedGroupName] = useState(currentName);

  React.useEffect(() => {
    if (visible) {
      setEditedGroupName(currentName);
    }
  }, [visible, currentName]);

  const handleSave = async () => {
    if (!groupId || !userId || editedGroupName.trim() === currentName.trim()) return;

    try {
      await updateGroupName({
        groupId,
        requesterUserId: userId,
        newName: editedGroupName,
      });
      onClose();
      refreshGroup({ groupId });
      Alert.alert('Success', 'Group name updated');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Update failed');
      console.error(err);
    }
  };

  const isUnchanged = editedGroupName.trim() === currentName.trim();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Group Name</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.textInput}
            value={editedGroupName}
            onChangeText={setEditedGroupName}
            placeholder="Enter new group name"
          />

          <TouchableOpacity
            style={[styles.saveButton, isUnchanged && { opacity: 0.5 }]}
            onPress={handleSave}
            disabled={isUnchanged}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000050',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginTop: 16,
    marginBottom: 20,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#457B83',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
