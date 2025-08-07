import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from "react-native";
import UserAvatar from "@/assets/UserAvatar";
import { Ionicons } from "@expo/vector-icons";
import { useCreateGroup } from "@/hooks/apis/groups/useCreateGroup";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useGetUserDetails } from "@/hooks/apis/player-finder/useGetUserDetails";
import ContactsModal, { Contact } from "../find-player/contacts-modal/ContactsModal";

type Player = {
  id: string;
  name: string;
  phoneNumber: string;
};

export default function CreateGroup({ onClose }: { onClose: () => void }) {
    const { user } = useSelector((state: RootState) => state.auth);
    const { createGroup, status, error } = useCreateGroup();
    const [groupName, setGroupName] = useState("");
    const [selectedPlayer, setSelectedPlayer] =  useState<Contact[]>([]);
    const [showContactsModal, setShowContactsModal] = useState(false);
    const [preferredContacts, setPreferredContacts] = useState<Player[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const { data: userDetails } = useGetUserDetails(user?.userId);

    useEffect(() => {
    if (userDetails?.playerDetails?.preferToPlayWith) {
        setPreferredContacts(userDetails.playerDetails.preferToPlayWith.map(c => ({
        name: c.contactName,
        phoneNumber: c.contactPhoneNumber,
        })));
    }
    }, [userDetails]);

    const normalizeContact = (c: any): Contact => ({
            contactName: c.contactName ?? c.name ?? '',
            contactPhoneNumber: c.contactPhoneNumber ?? c.phoneNumber ?? '',
        });      

        const onSave = async () => {
          if (!groupName.trim()) {
            alert("Group name is required.");
            return;
          }
        
          const creatorUserId = user?.userId;
        
          const allMembers = players.map((p) => ({
            name: p.name,
            phoneNumber: p.phoneNumber,
            admin: true, // or dynamic based on logic
          }));
        
          const payload = {
            name: groupName,
            creatorUserId,
            members: allMembers,
          };
        
          await createGroup({
            groupData: payload,
            callbacks: {
              onSuccess: () => {
                alert("Group created successfully!");
                onClose();
                setShowContactsModal(false);
              },
              onError: (err) => {
                alert(`Failed to create group: ${err.message}`);
              },
            },
          });
        };        
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: "padding" })}
        keyboardVerticalOffset={80}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
            <TouchableOpacity
                onPress={onClose}
                style={styles.backButton}
            >
                <Ionicons name="arrow-back" size={24} color="#cce5e3" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Create Group</Text>
            <Text style={styles.subtitle}>Fill out details to create group</Text>
            </View>
            <UserAvatar size={30} />
        </View>

        {/* Form */}
        <ScrollView
          style={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name Input */}
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              placeholder="Enter group name"
              placeholderTextColor="#999"
              style={styles.textInput}
              value={groupName}
              onChangeText={setGroupName}
              returnKeyType="done"
            />
          </View>

          {/* Add Player */}
            <Text style={styles.label}>Add Player</Text>
              <View style={styles.addRow}>

                <TouchableOpacity
                onPress={() => setShowContactsModal(true)}
                style={styles.addButton}
                activeOpacity={0.7}
                >
                <Ionicons name="add" size={22} color="#fff" />
                </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
                {players.map((player) => (
                    <View key={player.id} style={styles.tag}>
                        <Text style={styles.tagText}>{player.name}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>

        {status === "loading" && <Text style={{ textAlign: 'center' }}>Creating group...</Text>}
        {error && <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>}

        {/* Save button */}
        <TouchableOpacity
            onPress={onSave}
            style={[styles.saveButton, status === "loading" && { opacity: 0.6 }]}
            activeOpacity={0.8}
            disabled={status === "loading"}
            >
            <Text style={styles.saveButtonText}>
                {status === "loading" ? "Saving..." : "Save"}
            </Text>
        </TouchableOpacity>

        <ContactsModal
          visible={showContactsModal}
          onClose={() => setShowContactsModal(false)}
          onSelectContacts={(selected) => {
            const normalized = selected.map(normalizeContact);

            // Set selectedPlayer (for payload)
            setSelectedPlayer(normalized);

            // Set players (for UI display)
            setPlayers(normalized.map((p, index) => ({
              id: `${p.contactPhoneNumber}-${index}`,
              name: p.contactName,
              phoneNumber: p.contactPhoneNumber,
            })));
          }}
          selectedContacts={selectedPlayer}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#5E9CA3",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  headerContainer: {
    backgroundColor: "#5E9CA3",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    marginTop: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
    paddingLeft: 12,
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 20,
  },
  headerSubtitle: {
    color: "#cde5e8",
    fontWeight: "500",
    fontSize: 13,
    marginTop: 4,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: "#222",
  },
  textInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#222",
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerWrapper: {
    flex: 1,
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 6,
    overflow: "hidden",
  },
  picker: {
    height: 40,
    width: "100%",
    color: "#222",
  },
  addButton: {
    backgroundColor: "#5E9CA3",
    marginLeft: 10,
    paddingHorizontal: 14,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 20,
  },
  tag: {
    borderColor: "#5E9CA3",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: "#5E9CA3",
    fontWeight: "500",
    fontSize: 13,
  },
  saveButton: {
    height: 48,
    backgroundColor: "#5E9CA3",
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "400",
    fontSize: 17,
  },
});
