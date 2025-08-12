import React from 'react';
import {
  Modal,
  Pressable,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MemberInfoModal from './MemberInfoModal';

type Member = {
  userId?: string;
  name?: string;
  phoneNumber?: string;
  admin?: boolean;
  avatarUrl?: string;
};

type MemberOptionsModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedMember: Member | null;
  isCurrentUserAdmin: boolean;
  groupCreatedByUserId?: string;
  currentUserId?: string;
  showMemberInfoModal: boolean;
  setShowMemberInfoModal: (visible: boolean) => void;
  handleToggleAdmin: () => Promise<void>;
  handleRemove: () => void;
};

export default function MemberOptionsModal({
  visible,
  onClose,
  selectedMember,
  isCurrentUserAdmin,
  groupCreatedByUserId,
  currentUserId,
  showMemberInfoModal,
  setShowMemberInfoModal,
  handleToggleAdmin,
  handleRemove,
}: MemberOptionsModalProps) {
  if (!selectedMember) return null;

  // Block admin toggling for group creator & self
  const canToggleAdmin =
    isCurrentUserAdmin &&
    selectedMember.userId !== groupCreatedByUserId &&
    selectedMember.userId !== currentUserId;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            {selectedMember.avatarUrl ? (
              <Image source={{ uri: selectedMember.avatarUrl }} style={styles.modalMemberAvatar} />
            ) : (
              <View style={[styles.initialsCircle, { width: 40, height: 40, borderRadius: 20 }]}>
                <Text style={styles.initialsText}>
                  {selectedMember.name
                    ?.split(' ')
                    .map((word) => word[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </Text>
              </View>
            )}
            <Text style={[styles.modalTitle, { marginLeft: 12, flex: 1 }]}>
              {selectedMember.name ?? 'Member'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Always visible: Info option */}
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.modalOption} onPress={() => setShowMemberInfoModal(true)}>
              <View style={styles.modalOptionLeft}>
                <Text style={styles.modalOptionText}>Info</Text>
                <Feather name="info" size={18} color="#555" />
              </View>
            </TouchableOpacity>
            <MemberInfoModal
              visible={showMemberInfoModal}
              onClose={() => setShowMemberInfoModal(false)}
              member={selectedMember}
            />
          </View>

          {/* Admin Controls */}
          {canToggleAdmin && (
            <>
              <View style={styles.actionContainer}>
                <TouchableOpacity style={styles.modalOption} onPress={handleToggleAdmin}>
                  <View style={styles.modalOptionLeft}>
                    <Text style={styles.modalOptionText}>
                      {selectedMember.admin ? 'Remove as group admin' : 'Make group admin'}
                    </Text>
                    <Feather
                      name={selectedMember.admin ? 'user-x' : 'user-check'}
                      size={18}
                      color="#555"
                    />
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={[styles.modalOption, { marginTop: 10 }]}
                  onPress={handleRemove}
                >
                  <View style={styles.modalOptionLeft}>
                    <Text style={styles.modalButtonRemoveText}>Remove from group</Text>
                    <Feather name="user-minus" size={18} color="#a61c1c" />
                  </View>
                </TouchableOpacity>
              </View>
            </>
          )}
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
  modalMemberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  initialsCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2E7165",
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  initialsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
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
