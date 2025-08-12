import React from 'react';
import {
  Modal,
  Pressable,
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

type ExitGroupModalProps = {
  visible: boolean;
  onClose: () => void;
  groupId?: string;
  groupName?: string;
  userId?: string;
  userPhone?: string;
  removeMember: (
    params: { groupId: string; memberPhone: string; requesterUserId: string },
    callbacks: { onSuccess: () => void; onError: (err: any) => void }
  ) => void;
  navigateToGroups: () => void;
};

export default function ExitGroupModal({
  visible,
  onClose,
  groupId,
  groupName,
  userId,
  userPhone,
  removeMember,
  navigateToGroups,
}: ExitGroupModalProps) {
  const handleExitGroup = () => {
    if (!groupId) {
      Alert.alert('Error', 'Invalid group ID.');
      return;
    }
    if (!userId || !userPhone) {
      Alert.alert('Error', 'User info missing');
      return;
    }

    removeMember(
      {
        groupId,
        memberPhone: userPhone,
        requesterUserId: userId,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'You exited the group');
          onClose();
          navigateToGroups();
        },
        onError: (err: any) => {
          const errorMessage =
            err?.response?.data?.message || 'Only group admins can remove you';
          Alert.alert('Error', errorMessage);
          console.error('Exit group error:', err);
        },
      }
    );
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Exit group?</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            Do you want to exit {groupName ?? 'the'} group?
          </Text>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                handleExitGroup();
              }}
            >
              <View style={styles.modalOptionLeft}>
                <Text style={styles.modalOptionText}>Exit group</Text>
                <Feather name="log-out" size={18} color="#555" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.modalOption, { marginTop: 10 }]}
              onPress={() => {
                handleExitGroup();
              }}
            >
              <View style={styles.modalOptionLeft}>
                <Text style={styles.modalButtonRemoveText}>Exit and delete for me</Text>
                <Feather name="trash-2" size={18} color="#a61c1c" />
              </View>
            </TouchableOpacity>
          </View>
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
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  actionContainer: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  modalOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginRight: 8,
  },
  modalButtonRemoveText: {
    color: '#a61c1c',
    fontWeight: '600',
    fontSize: 16,
  },
});
