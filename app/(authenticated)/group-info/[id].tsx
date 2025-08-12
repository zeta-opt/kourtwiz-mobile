import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import { Feather} from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

import EditModal from '@/components/groups/EditModal';
import ExitGroupModal from '@/components/groups/ExitGroupModal';
import MemberOptionsModal from '@/components/groups/MemberOptionsModal';
import ContactsModal, { Contact } from '@/components/find-player/contacts-modal/ContactsModal';

import { useDeleteGroup } from '@/hooks/apis/groups/useDeleteGroup';
import { useUpdateGroupName } from '@/hooks/apis/groups/useUpdateGroupName';
import { useAddGroupMember } from '@/hooks/apis/groups/useAddMembers';
import { useUpdateGroupAdminStatus } from '@/hooks/apis/groups/useUpdateAdminStatus';
import { useRemoveGroupMember } from '@/hooks/apis/groups/useRemoveMember';
import { useGetGroupById } from '@/hooks/apis/groups/useGetGroupById';

const GroupInfoScreen: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.userId;
  const { id } = useLocalSearchParams(); // dynamic param from route
  const { getGroup, data: group, status} = useGetGroupById();
  const { updateAdminStatus } = useUpdateGroupAdminStatus();
  const { removeMember } = useRemoveGroupMember();
  const { deleteGroup } = useDeleteGroup();
  const { updateGroupName } = useUpdateGroupName();
  const { addMember } = useAddGroupMember();

  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [showMemberInfoModal, setShowMemberInfoModal] = useState(false);
  const [editGroupModalVisible, setEditGroupModalVisible] = useState(false);
  const [contactsModalVisible, setContactsModalVisible] = useState(false);

  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [favoriteGroups, setFavoriteGroups] = useState<string[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const isCurrentUserAdmin = group?.members?.find((m:any) => m.userId === user.userId)?.admin;
  const membersCount = group?.members?.length ?? 0;
  const maxListHeight = membersCount > 5 ? 350 : 'auto';

  useEffect(() => {
    if (id && typeof id === 'string') {
      getGroup({ groupId: id });
    }
  }, [id]);

  const openMemberModal = (member: any) => {
    setSelectedMember(member);
    setMemberModalVisible(true);
  };

  const closeMemberModal = () => {
    setSelectedMember(null);
    setMemberModalVisible(false);
  };

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const key = `favoriteGroups_${userId}`;
        const raw = await AsyncStorage.getItem(key);
        const storedFavorites = raw ? JSON.parse(raw) : [];
        setFavoriteGroups(storedFavorites);
      } catch (err) {
        console.warn('Error loading favorites', err);
        setFavoriteGroups([]);
      }
    };
    if (userId) {
      loadFavorites();
    }
  }, [userId]);

  const toggleFavorite = async (groupId: string) => {
    const key = `favoriteGroups_${userId}`;
    let updated;
    if (favoriteGroups.includes(groupId)) {
      updated = favoriteGroups.filter((id) => id !== groupId);
    } else {
      updated = [...favoriteGroups, groupId];
    }
    setFavoriteGroups(updated);
    try {
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to persist favorites', err);
    }
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
  
  const handleContactsSelected = async (contacts: Contact[]) => {
    setSelectedContacts(contacts);
  
    if (!id || typeof id !== 'string' || !user?.userId) {
      Alert.alert('Error', 'Missing required information to add members.');
      return;
    }
  
    for (const contact of contacts) {
      if (!contact.contactName || !contact.contactPhoneNumber) {
        console.warn("Skipping invalid contact:", contact);
        continue;
      }
      
      try {
        await addMember({
          groupId: id,
          requesterUserId: user.userId,
          memberData: {
            name: contact.contactName,
            phoneNumber: contact.contactPhoneNumber,
          },
          callbacks: {
            onSuccess: () => {
              console.log(`Added ${contact.contactName}`);
            },
            onError: (err) => {
              console.error(`Failed to add ${contact.contactName}`, err.message);
            },
          },
        });
      } catch (err) {
        console.error('Error adding member:', err);
      }
    }
  
    getGroup({ groupId: id });
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
              .map((word: string) => word[0])
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace({ pathname: '/chat-summary', params: { id } })}>
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Group info</Text>
          {isCurrentUserAdmin && (
            <TouchableOpacity style={styles.editButton} onPress={() => setEditGroupModalVisible(true)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

          {/* Group Logo */}
          <View style={styles.logoContainer}>
            <View style={[styles.initialsCircle, { width: 100, height: 100, borderRadius: 50 }]}>
              <Text style={[styles.initialsText, { fontSize: 32 }]}>
                {group?.name
                  ?.split(' ')
                  .map((word: string) => word[0])
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
            <TouchableOpacity onPress={() => setContactsModalVisible(true)}>
              <Text style={[styles.sectionTitle, { color: '#257073' }]}>Add Members</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.membersListContainer, { maxHeight: maxListHeight, }]}>
            <FlatList
              data={group?.members ?? []}
              renderItem={renderMember}
              keyExtractor={(item) => item.userId || item.id || Math.random().toString()}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              ItemSeparatorComponent={() => <View style={styles.actionSeparator} />}
            />
          </View>

          {/* Actions */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleFavorite(typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '')}
            >
              <Text style={styles.actionText}>
                {favoriteGroups.includes(typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '') ? 'Remove from Favorites' : 'Add to Favorites'}
              </Text>
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
            {user?.userId === group?.createdByUserId  && (
              <TouchableOpacity style={styles.actionButton} onPress={handleDeleteGroup}>
                <Text style={[styles.actionText, { color: '#a61c1c' }]}>Delete Group</Text>
              </TouchableOpacity>
            )}
          </View>

        <EditModal
          visible={editGroupModalVisible}
          onClose={() => setEditGroupModalVisible(false)}
          groupId={typeof id === 'string' ? id : Array.isArray(id) ? id[0] : undefined}
          userId={user?.userId}
          currentName={group?.name ?? ''}
          updateGroupName={async (params) => { await updateGroupName(params); }}
          refreshGroup={getGroup}
        />

        <ExitGroupModal
          visible={exitModalVisible}
          onClose={() => setExitModalVisible(false)}
          groupId={typeof id === 'string' ? id : Array.isArray(id) ? id[0] : undefined}
          groupName={group?.name}
          userId={user?.userId}
          userPhone={user?.phoneNumber}
          removeMember={removeMember}
          navigateToGroups={() => router.replace('/groups')}
        />

        <MemberOptionsModal
          visible={memberModalVisible}
          onClose={closeMemberModal}
          selectedMember={selectedMember}
          isCurrentUserAdmin={isCurrentUserAdmin}
          groupCreatedByUserId={group?.createdByUserId}
          currentUserId={user?.userId}
          showMemberInfoModal={showMemberInfoModal}
          setShowMemberInfoModal={setShowMemberInfoModal}
          handleToggleAdmin={handleToggleAdmin}
          handleRemove={handleRemove}
        />

        <ContactsModal
          visible={contactsModalVisible}
          onClose={() => setContactsModalVisible(false)}
          onSelectContacts={handleContactsSelected}
          selectedContacts={selectedContacts}
        />
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
    marginTop: 50,
    marginBottom: 8,
    fontWeight: '700',
    fontSize: 14,
    color: '#404040',
  },
  membersListContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
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
    fontWeight: '600',
    color: '#404040',
  },
  adminText: {
    marginLeft: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#257073',
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
  modalOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default GroupInfoScreen;