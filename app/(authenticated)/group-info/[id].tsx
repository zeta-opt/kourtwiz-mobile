import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { Feather} from '@expo/vector-icons';
import { useGetGroupById } from '@/hooks/apis/groups/useGetGroupById';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useUpdateGroupAdminStatus } from '@/hooks/apis/groups/useUpdateAdminStatus';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRemoveGroupMember } from '@/hooks/apis/groups/useRemoveMember';
import MemberInfoModal from '@/components/groups/MemberInfoModal';
import { useDeleteGroup } from '@/hooks/apis/groups/useDeleteGroup';
import { useUpdateGroupName } from '@/hooks/apis/groups/useUpdateGroupName';

const GroupInfoScreen: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { id } = useLocalSearchParams(); // dynamic param from route
  const { getGroup, data: group, status} = useGetGroupById();
  const { updateAdminStatus } = useUpdateGroupAdminStatus();
  const { removeMember } = useRemoveGroupMember();
  const { deleteGroup } = useDeleteGroup();
  const { updateGroupName } = useUpdateGroupName();


  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [showMemberInfoModal, setShowMemberInfoModal] = useState(false);
  const [editGroupModalVisible, setEditGroupModalVisible] = useState(false);
  const [editedGroupName, setEditedGroupName] = useState(group?.name || '');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const isCurrentUserAdmin = group?.members?.find(m => m.userId === user.userId)?.admin;

  useEffect(() => {
    if (id && typeof id === 'string') {
      getGroup({ groupId: id });
    }
  }, [id]);

  useEffect(() => {
    if (group?.name) {
      setEditedGroupName(group.name);
    }
  }, [group]);

  const openMemberModal = (member: any) => {
    setSelectedMember(member);
    setMemberModalVisible(true);
  };

  const closeMemberModal = () => {
    setSelectedMember(null);
    setMemberModalVisible(false);
  };

  const handleToggleAdmin = async () => {
    if (!id || typeof id !== 'string' || !selectedMember || !user?.userId) {
      Alert.alert('Error', 'Missing required information to update admin status.');
      return;
    }
    const makeAdmin = !selectedMember.admin;
  
    try {
      await updateAdminStatus({
        groupId: id,
        requesterUserId: user.userId,
        targetPhone: selectedMember.phoneNumber,
        makeAdmin,
      });
  
      Alert.alert(
        'Success',
        `${selectedMember.name} has been ${makeAdmin ? 'made' : 'removed as'} a group admin.`
      );
      closeMemberModal();
      getGroup({ groupId: id });
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to update admin status.');
    }
  };  
  
  const handleRemove = () => {
    if (!id || typeof id !== 'string') {
      Alert.alert('Error', 'Invalid group ID.');
      return;
    }
  
    if (!selectedMember?.phoneNumber || !user?.userId) {
      Alert.alert('Error', 'Missing member or user information.');
      return;
    }
  
    removeMember(
      {
        groupId: id,
        memberPhone: selectedMember.phoneNumber,
        requesterUserId: user.userId,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Member removed successfully');
          closeMemberModal();
          getGroup({ groupId: id });
        },
        onError: (err) => {
          Alert.alert('Error', err.message || 'Failed to remove member.');
          console.error('Error removing member:', err);
        },
      }
    );
  };  

  const handleExitGroup = () => {
    if (!id || typeof id !== 'string') {
      Alert.alert('Error', 'Invalid group ID.');
      return;
    }
  
    if (!user?.userId || !user?.phoneNumber) {
      Alert.alert('Error', 'User info missing');
      return;
    }
  
    removeMember(
      {
        groupId: id,
        memberPhone: user.phoneNumber,
        requesterUserId: user.userId,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'You exited the group');
          setExitModalVisible(false);
          router.replace('/groups');
        },
        onError: (err: any) => {
          const errorMessage = err?.response?.data?.message || 'Group creator cannot exit the group';
          Alert.alert('Error', errorMessage);
          console.error('Exit group error:', err);
        }              
      }
    );
  };  

  const handleDeleteGroup = () => {
    if (!id || typeof id !== 'string') {
      Alert.alert('Error', 'Invalid group ID.');
      return;
    }
  
    if (!user?.userId) {
      Alert.alert('Error', 'User info missing');
      return;
    }
  
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteGroup(
              {
                groupId: id,
                requesterUserId: user.userId,
              },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'Group deleted successfully');
                  router.replace('/groups');
                },
                onError: (err:any) => {
                  Alert.alert('Error', err?.response?.data?.message || 'Only group admins can perform this action');
                  console.error('Delete group error:', err);
                },
              }
            );
          },
        },
      ]
    );
  };
  

  const renderMember = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.memberRow} onPress={() => openMemberModal(item)}>
      {item.avatarUrl ? (
        <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.initialsCircle}>
          <Text style={styles.initialsText}>
            {item.name
              ?.split(' ')
              .map((word) => word[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </Text>
        </View>
      )}
      <View style={{flex: 1, marginLeft: 12,}}>
      <Text style={styles.memberName}>{item.name}</Text>
      </View>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8,}}>
      {item.admin && <Text style={styles.adminText}>Admin</Text>}
      <Feather name="chevron-right" size={20} color="#a0a0a0" style={{ marginLeft: 'auto' }} />
      </View>
    </TouchableOpacity>
  );

  if (status === 'loading') {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  if (status === 'error') {
    return (
      <View style={{ marginTop: 50, alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Failed to load group info</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#E0F7FA', '#FFFFFF']} style={{ flex: 1, padding: 10 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/groups')}>
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Group info</Text>
          {isCurrentUserAdmin && (
            <TouchableOpacity style={styles.editButton} onPress={() => setEditGroupModalVisible(true)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Group Logo */}
          <View style={styles.logoContainer}>
            <View style={[styles.initialsCircle, { width: 100, height: 100, borderRadius: 50 }]}>
              <Text style={[styles.initialsText, { fontSize: 32 }]}>
                {group?.name
                  ?.split(' ')
                  .map((word) => word[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </Text>
            </View>
          </View>

          {/* Group Name and Members count */}
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.groupName}>{group?.name ?? 'Group'}</Text>
            <Text style={styles.groupMembers}>
              Group: {group?.members?.length ?? 0} members
            </Text>
          </View>

          {/* Members section */}
          <View style={styles.modalOptionLeft}>
          <Text style={styles.sectionTitle}>Members</Text>
          <TouchableOpacity style={styles.sectionTitle}><Text style={[styles.actionText, { color: '#257073' }]}>Add Members</Text></TouchableOpacity>
          </View>

          <View style={styles.membersListContainer}>
            <FlatList
              data={group?.members ?? []}
              renderItem={renderMember}
              keyExtractor={(item) => item.userId || item.id || Math.random().toString()}
              scrollEnabled={group?.members?.length > 5}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>

          {/* Actions */}
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={[styles.actionText, { color: '#222' }]}>Add to Favourites</Text>
            </TouchableOpacity>
            <View style={styles.actionSeparator} />
            <TouchableOpacity style={styles.actionButton}>
              <Text style={[styles.actionText, { color: '#a61c1c' }]}>Clear Chat</Text>
            </TouchableOpacity>
            <View style={styles.actionSeparator} />
            {!isCurrentUserAdmin &&(
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setExitModalVisible(true)}
                testID="exitGroupButton"
              >
                <Text style={[styles.actionText, { color: '#a61c1c' }]}>Exit Group</Text>
              </TouchableOpacity>
            )}
            <View style={styles.actionSeparator} />
            <TouchableOpacity style={styles.actionButton} onPress={handleDeleteGroup}>
              <Text style={[styles.actionText, { color: '#a61c1c' }]}>Delete Group</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal
          animationType="slide"
          transparent
          visible={editGroupModalVisible}
          onRequestClose={() => setEditGroupModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setEditGroupModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Group Name</Text>
                <TouchableOpacity onPress={() => setEditGroupModalVisible(false)}>
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
                style={styles.saveButton}
                onPress={async () => {
                  if (!id || typeof id !== 'string' || !user?.userId) return;

                  try {
                    await updateGroupName({
                      groupId: id,
                      requesterUserId: user.userId,
                      newName: editedGroupName,
                    });
                    setEditGroupModalVisible(false);
                    getGroup({ groupId: id });
                    Alert.alert('Success', 'Group name updated');
                  } catch (err: any) {
                    Alert.alert('Error', err?.response?.data?.message || 'Update failed');
                    console.error(err);
                  }
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* Exit Group Modal */}
        <Modal
          animationType="slide"
          transparent
          visible={exitModalVisible}
          onRequestClose={() => setExitModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setExitModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Exit group?</Text>
                <TouchableOpacity onPress={() => setExitModalVisible(false)}>
                  <Feather name="x" size={20} color="#000" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Do you want to exit {group?.name ?? 'the'} group?
              </Text>

              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    handleExitGroup()
                    setExitModalVisible(false);
                    router.replace('/groups')
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
                    handleExitGroup()
                    setExitModalVisible(false);
                    router.replace('/groups')
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

        {/* Member Options Modal */}
        <Modal
          animationType="slide"
          transparent
          visible={memberModalVisible}
          onRequestClose={closeMemberModal}
        >
          <Pressable style={styles.modalOverlay} onPress={closeMemberModal}>
            <View style={styles.modalContainer}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                {selectedMember?.avatarUrl ? (
                  <Image source={{ uri: selectedMember.avatarUrl }} style={styles.modalMemberAvatar} />
                ) : (
                  <View style={[styles.initialsCircle, { width: 40, height: 40, borderRadius: 20 }]}>
                    <Text style={styles.initialsText}>
                      {selectedMember?.name
                        ?.split(' ')
                        .map((word: string) => word[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </Text>
                  </View>
                )}
                <Text style={[styles.modalTitle, { marginLeft: 12, flex: 1 }]}>
                  {selectedMember?.name ?? 'Member'}
                </Text>
                <TouchableOpacity onPress={closeMemberModal}>
                  <Feather name="x" size={20} color="#000" />
                </TouchableOpacity>
              </View>

              {/* Always-visible: Info Option */}
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => setShowMemberInfoModal(true)}
                >
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

              {/* Conditionally render Admin Controls */}
              {isCurrentUserAdmin && (
                <>
                  <View style={styles.actionContainer}>
                    <TouchableOpacity
                      style={styles.modalOption}
                      onPress={handleToggleAdmin}
                    >
                      <View style={styles.modalOptionLeft}>
                        <Text style={styles.modalOptionText}>
                          {selectedMember?.admin ? 'Remove as group admin' : 'Make group admin'}
                        </Text>
                        <Feather
                          name={selectedMember?.admin ? 'user-x' : 'user-check'}
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
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#d6e3e7',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  initialsCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  initialsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#404040',
    textAlign: 'center',
    marginRight: 40,
  },
  editButton: {
    padding: 8,
  },
  editText: {
    color: '#257073',
    fontSize: 16,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 16,
    marginBottom: 20,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#257073',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },  
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  groupName: {
    fontWeight: '700',
    fontSize: 18,
    color: '#404040',
  },
  groupMembers: {
    fontWeight: '400',
    color: '#a2a2a2',
    fontSize: 13,
    marginTop: 4,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
    fontWeight: '700',
    fontSize: 14,
    color: '#404040',
  },
  membersListContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: 350,
    elevation: 1,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: '100%',
    backgroundColor: '#fff',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#404040',
  },
  adminText: {
    marginLeft: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#257073',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginLeft: 64,
    width: '100%',
  },
  actionContainer: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  actionText: {
    fontWeight: '500',
    fontSize: 14,
  },
  actionSeparator: {
    height: 1,
    backgroundColor: '#ddd',
  },
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
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalButtonExit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  modalButtonExitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginRight: 8,
  },
  modalButtonRemove: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonRemoveMember: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonRemoveText: {
    color: '#a61c1c',
    fontWeight: '600',
    fontSize: 16,
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
  modalMemberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default GroupInfoScreen;