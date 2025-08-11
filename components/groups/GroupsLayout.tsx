import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UserAvatar from "@/assets/UserAvatar";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import CreateGroup, {Player} from "./CreateGroup";
import ContactsModal, { Contact } from "../find-player/contacts-modal/ContactsModal";
import { useGetGroupsByPhoneNumber } from '@/hooks/apis/groups/useGetGroups';
import { useSelector } from "react-redux";
import { RootState } from "@/store";

// Filter types
const FILTERS = [
  { key: "all", label: "All" },
  { key: "read", label: "Read" },
  { key: "unread", label: "Unread" },
  { key: "group", label: "Group" },
];

export default function GroupsScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { getGroups, status, error, data } = useGetGroupsByPhoneNumber();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Contact[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [groupName, setGroupName] = useState("");

  const normalizeContact = (c: any): Contact => ({
    contactName: c.contactName ?? c.name ?? '',
    contactPhoneNumber: c.contactPhoneNumber ?? c.phoneNumber ?? '',
  });

  useEffect(() => {
    if (user?.phoneNumber) {
      getGroups({ phoneNumber: user.phoneNumber });
    }
  }, [user?.phoneNumber]);

  // Filter data based on filter and search
  const filteredData = (data ?? []).filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.latestMessage?.toLowerCase().includes(search.toLowerCase());
  
    if (!matchesSearch) return false;
  
    if (filter === 'read') return item.read === true;
    if (filter === 'unread') return item.unread > 0;
    if (filter === 'group') return item.isGroup === true;
  
    return true;
  });
  
  const countUnread = (data ?? []).filter((item) => item.unread > 0).length;
  const countGroup = (data ?? []).filter((item) => item.isGroup).length;    

  // Render each message row
  const renderItem = ({ item }) => {
    const adminMember = item.members?.find(
      (member) => member.userId === item.createdByUserId
    );
    const adminName = adminMember?.name || "Admin";
  
    return (
      <TouchableOpacity style={styles.messageRow} onPress={() => router.replace(`/group-info/${item.id}`)}>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.initialsCircle}>
            <Text style={styles.initialsText}>
              {item.name
                .split(' ')
                .map((word) => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </Text>
          </View>
        )}
        <View style={styles.messageContent}>
          <View style={styles.rowSpaceBetween}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.time}>{item.lastUpdated || ''}</Text>
          </View>
          <View style={styles.rowSpaceBetween}>
            <Text
              style={[styles.messageText, item.unread ? styles.unreadText : {}]}
              numberOfLines={1}
            >
              {item.latestMessage
                ? item.latestMessage
                : item.createdByUserId === user.userId
                ? 'You are the admin'
                : `${adminName} added you`}
            </Text>
            {item.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };    

  return (
    <LinearGradient colors={['#E0F7FA', '#FFFFFF']} style={{ flex: 1, padding: 10, }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(authenticated)/home')}>
            <Ionicons name="chevron-back-outline" size={24} color="#4A4A4A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Groups</Text>
        <TouchableOpacity onPress={() => router.replace('/(authenticated)/home')}>
            <UserAvatar size={36} />
        </TouchableOpacity>
      </View>

      {/* Search box */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#8E8E8E"
          style={{ marginLeft: 12, marginRight: 6 }}
        />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#8E8E8E"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {FILTERS.map(({ key, label }) => {
          let count = 0;
          if (key === "unread") count = countUnread;
          else if (key === "group") count = countGroup;

          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.filterBtn,
                filter === key ? styles.filterBtnActive : styles.filterBtnInactive,
              ]}
              onPress={() => setFilter(key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === key ? styles.filterTextActive : styles.filterTextInactive,
                ]}
              >
                {label}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.filterCountBadge,
                    filter === key ? styles.filterCountBadgeActive : styles.filterCountBadgeInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterCountText,
                      filter === key ? styles.filterCountTextActive : styles.filterCountTextInactive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {status === 'loading' && <Text>Loading groups...</Text>}
      {status === 'error' && <Text>Error: {error}</Text>}

      {/* Message list */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      />

        {/* Open Modal Button */}
        <TouchableOpacity
            style={styles.createButton}
            onPress={() => setModalVisible(true)}
        >
            <Text style={styles.createButtonText}>Create Group</Text>
        </TouchableOpacity>

       {/* Create Group Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        presentationStyle="fullScreen"
      >
        <CreateGroup
          onClose={() => setModalVisible(false)}
          onAddPlayers={() => {
            setModalVisible(false);
            setContactsModalVisible(true);
          }}
          groupName={groupName}
          setGroupName={setGroupName}
          players={players}
          setPlayers={setPlayers}
        />
      </Modal>

      {/* Contacts Modal at top level */}
      <ContactsModal
        visible={contactsModalVisible}
        onClose={() => {
          setContactsModalVisible(false);
          setModalVisible(true);
        }}
        onSelectContacts={(selected) => {
          const normalized = selected.map(normalizeContact);
          setSelectedPlayer(normalized);
          setPlayers(normalized.map((p, index) => ({
            id: `${p.contactPhoneNumber}-${index}`,
            name: p.contactName,
            phoneNumber: p.contactPhoneNumber,
          })));
          setContactsModalVisible(false);
          setModalVisible(true);
        }}
        selectedContacts={selectedPlayer}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D9E3E3", // pale blue background
    paddingTop: 54,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  backIcon: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#bbb",
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7F8",
    borderRadius: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#2E2E2E",
    paddingVertical: 8,
  },
  filters: {
    flexDirection: "row",
    marginBottom: 16,
  },
  filterBtn: {
    flexDirection: "row",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    marginRight: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  filterBtnActive: {
    backgroundColor: "#2E7165",
    borderColor: "#2E7165",
  },
  filterBtnInactive: {
    backgroundColor: "transparent",
    borderColor: "#2E7165",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#ffffff",
  },
  filterTextInactive: {
    color: "#2E7165",
  },
  filterCountBadge: {
    marginLeft: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  filterCountBadgeActive: {
    backgroundColor: "#ffffff",
  },
  filterCountBadgeInactive: {
    backgroundColor: "#2E7165",
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: "600",
  },
  filterCountTextActive: {
    color: "#2E7165",
  },
  filterCountTextInactive: {
    color: "#fff",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E3E9EA",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#ccc",
  },
  messageContent: {
    flex: 1,
    justifyContent: "center",
  },
  rowSpaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
  },
  verifiedBadge: {
    marginLeft: 6,
  },
  time: {
    fontSize: 11,
    fontWeight: "400",
    color: "#6492A6",
  },
  messageText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#4A4A4A",
    flex: 1,
  },
  unreadText: {
    fontWeight: "700",
    color: "#2E7165",
  },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#2E7165",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  createButton: {
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: "#2E7165",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 30,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});