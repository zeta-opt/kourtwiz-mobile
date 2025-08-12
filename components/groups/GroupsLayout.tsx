import React, { useEffect, useMemo, useState } from "react";
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
import AsyncStorage from '@react-native-async-storage/async-storage';

// Filter types
const FILTERS = [
  { key: "all", label: "All" },
  { key: "read", label: "Read" },
  { key: "unread", label: "Unread" },
  { key: "favorite", label: "Favorites" },
];

export default function GroupsScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId;
  const { getGroups, status, error, data } = useGetGroupsByPhoneNumber();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Contact[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [groupName, setGroupName] = useState("");
  const [favoriteGroups, setFavoriteGroups] = useState<string[]>([]);
  const [lastReadTimestamps, setLastReadTimestamps] = useState<{ [key: string]: string }>({});

  const normalizeContact = (c: any): Contact => ({
    contactName: c.contactName ?? c.name ?? '',
    contactPhoneNumber: c.contactPhoneNumber ?? c.phoneNumber ?? '',
  });

  useEffect(() => {
    if (user?.phoneNumber) {
      getGroups({ phoneNumber: user.phoneNumber });
    }
  }, [user?.phoneNumber]);

  // Parse string or array timestamp into Date | null
  function parseTimestamp(ts: any): Date | null {
    if (!ts) return null;

    // Firestore-like array timestamp [year, month, day, hour, minute, second, nanosecond]
    if (Array.isArray(ts)) {
      const [y, mon, d, h = 0, mi = 0, s = 0, nano = 0] = ts;
      const ms = Math.floor((nano || 0) / 1_000_000);
      return new Date(Date.UTC(y, (mon || 1) - 1, d || 1, h, mi, s, ms));
    }

    // ISO string or numeric epoch
    if (typeof ts === "string" || typeof ts === "number") {
      const dt = new Date(ts);
      return isNaN(dt.getTime()) ? null : dt;
    }

    if (ts instanceof Date) return ts;
    return null;
  }

  // Robust: get latest timestamp from comments array (null if none)
  function getLatestCommentTimestamp(comments: any[] | undefined): Date | null {
    if (!comments || comments.length === 0) return null;
    let max: Date | null = null;
    for (const c of comments) {
      // tolerate several possible field names
      const rawTs = c.timestamp ?? c.time ?? c.createdAt ?? c.created_at ?? c.editedAt ?? c.date ?? c.ts;
      const d = parseTimestamp(rawTs);
      if (d && (!max || d > max)) max = d;
    }
    return max;
  }

  // UNIFY place to compute the group's latest message time (comments -> fallback lastUpdated)
  function getGroupLatestMessageTime(item: any): Date | null {
    const latestFromComments = getLatestCommentTimestamp(item.comments || []);
    if (latestFromComments) return latestFromComments;

    // check possible lastUpdated fields
    const fallback = parseTimestamp(item.lastUpdated ?? item.updatedAt ?? item.updated_at ?? item.last_update);
    return fallback;
  }

  // handleOpenChat accepts optional latestMessageTime to set lastRead timestamp correctly
  const handleOpenChat = async (groupId: string, latestMessageTime?: Date | null) => {
    const tsValue = latestMessageTime ? latestMessageTime.toISOString() : new Date().toISOString();
    const updatedTimestamps = {
      ...lastReadTimestamps,
      [groupId]: tsValue,
    };
    setLastReadTimestamps(updatedTimestamps);
    try {
      await AsyncStorage.setItem('lastReadTimestamps', JSON.stringify(updatedTimestamps));
    } catch (err) {
      console.warn('Failed to persist lastReadTimestamps', err);
    }
    router.replace({ pathname: '/chat-summary', params: { id: groupId } });
  };

  // Load saved lastRead timestamps (safe)
  useEffect(() => {
    const loadLastReadData = async () => {
      try {
        const raw = await AsyncStorage.getItem('lastReadTimestamps');
        const storedTimestamps = raw ? JSON.parse(raw) : {};
        setLastReadTimestamps(storedTimestamps);
      } catch (err) {
        console.warn('Error loading lastReadTimestamps', err);
        setLastReadTimestamps({});
      }
    };
    loadLastReadData();
  }, []);

  // Load saved favorites when user changes
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
      updated = favoriteGroups.filter(id => id !== groupId);
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

  // ---------- FIX: use unified logic for unread calculation ----------
  // Only consider a group unread when it *has a latest message* AND that message is newer than the last-read timestamp.
  function groupHasUnread(item: any): boolean {
    const latestMessageTime = getGroupLatestMessageTime(item);
    if (!latestMessageTime) return false; // no messages -> nothing to be unread
    const lastReadRaw = lastReadTimestamps[item.id];
    if (!lastReadRaw) return true; // there's a message but user never opened -> unread
    const lastReadDate = new Date(lastReadRaw);
    return latestMessageTime.getTime() > lastReadDate.getTime();
  }

  // Filtered data (memoized for perf)
  const filteredData = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    return (data ?? []).filter((item: any) => {
      // search match (name or latestMessage text)
      const name = (item.name ?? "").toString().toLowerCase();
      const latestMessageText = (item.latestMessage ?? "").toString().toLowerCase();
      const matchesSearch = !q || name.includes(q) || latestMessageText.includes(q);
      if (!matchesSearch) return false;

      const unread = groupHasUnread(item);
      if (filter === "read") return !unread;
      if (filter === "unread") return unread;
      if (filter === "favorite") return favoriteGroups.includes(item.id);

      return true;
    });
  }, [data, search, filter, favoriteGroups, lastReadTimestamps]);

  // ---------- RENDER ----------
  const renderItem = ({ item }: { item: any }) => {
    const adminMember = item.members?.find((m: any) => m.userId === item.createdByUserId);
    const adminName = adminMember?.name || "Admin";

    const latestMessageTime = getGroupLatestMessageTime(item); // unified source
    const lastReadAt = lastReadTimestamps[item.id];
    const lastReadDate = lastReadAt ? new Date(lastReadAt) : null;
    const hasMessages = Boolean(latestMessageTime);
    const isRead = hasMessages ? (lastReadDate ? latestMessageTime!.getTime() <= lastReadDate.getTime() : false) : true;
    const isFavorite = favoriteGroups.includes(item.id);

    let messagePreview = "No new messages";
    if (!hasMessages) {
      messagePreview = item.createdByUserId && item.createdByUserId !== user?.userId
        ? `${adminName} added you`
        : "You are the Admin";
    } else {
      messagePreview = !isRead ? "new messages" : "No new messages";
    }

    return (
      <TouchableOpacity
        style={styles.messageRow}
        onPress={() => handleOpenChat(item.id, latestMessageTime)}
        onLongPress={() => toggleFavorite(item.id)}
      >
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.initialsCircle}>
            <Text style={styles.initialsText}>
              {(item.name || "")
                .split(' ')
                .map((w: string) => w[0] || '')
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </Text>
          </View>
        )}

        <View style={styles.messageContent}>
          <View style={styles.rowSpaceBetween}>
            <Text style={styles.name}>
              {item.name}
              {isFavorite && (
                <Ionicons
                  name="star"
                  size={16}
                  color="#FFD700"
                  style={{ marginLeft: 4 }}
                />
              )}
            </Text>
            <Text style={styles.time}>
              {latestMessageTime ? latestMessageTime.toLocaleString() : (item.lastUpdated || '')}
            </Text>
          </View>

          <View style={styles.rowSpaceBetween}>
            <Text
              style={[styles.messageText, !isRead && styles.unreadText]}
              numberOfLines={1}
            >
              {messagePreview}
            </Text>

            {!isRead && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>•</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ---------- UI: filter badges counts use same logic ----------
  const unreadCount = (data ?? []).filter(g => groupHasUnread(g)).length;
  const favoriteCount = favoriteGroups.length;

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
          if (key === "unread") {
            count = unreadCount;
          } else if (key === "favorite") {
            count = favoriteCount;
          }

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

      {filter === "favorite" && (
        <Text style={styles.favoriteHint}>
          Long press a group to add it in favorites
        </Text>
      )}

      {status === 'loading' && <Text>Loading groups...</Text>}
      {status === 'error' && <Text>Error: {error}</Text>}

      {/* Message list */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7F8",
    borderWidth: 1,
    borderColor: "#2E2E2E",
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
  favoriteHint: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginVertical: 6,
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