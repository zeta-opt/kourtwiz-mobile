import UserAvatar from '@/assets/UserAvatar';
import { useGetPreferredPlaces } from '@/hooks/apis/player-finder/useGetPreferredPlaces';
import { RootState } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSelector } from 'react-redux';

type CourtData = {
  id: string;
  name: string;
  location: string;
  courtType: string;
  courtPurpose: string;
};

const ReserveCourtScreen = () => {
  const [searchText, setSearchText] = React.useState("");
  const [filteredData, setFilteredData] = React.useState<CourtData[]>([]);

  const { user } = useSelector((state: RootState) => state.auth);

  const {
    data: preferredPlaces,
    status: preferredStatus,
    refetch,
  } = useGetPreferredPlaces({ userId: user?.userId });

  // Apply search filter whenever API data or searchText changes
  React.useEffect(() => {
    if (!preferredPlaces) return;

    if (searchText.trim() === "") {
      setFilteredData(preferredPlaces as CourtData[]);
    } else {
      const lowered = searchText.toLowerCase();
      setFilteredData(
        (preferredPlaces as CourtData[]).filter(
          (item) =>
            item.name.toLowerCase().includes(lowered) ||
            item.location.toLowerCase().includes(lowered) ||
            item.courtPurpose.toLowerCase().includes(lowered)
        )
      );
    }
  }, [searchText, preferredPlaces]);

  const renderItem = ({ item }: { item: CourtData }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/(authenticated)/reserve-court/[id]",
          params: { id: item.id, name: item.name },
        })
      }
    >
      <Image
        source={
          item.courtPurpose.toLowerCase().includes("pickleball")
            ? require("@/assets/images/pickleball_player.png")
            : require("@/assets/images/FindPlayerCardImage.png")
        }
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.location}>{item.location}</Text>
        <Text style={styles.details}>
          {item.courtType} | {item.courtPurpose}
        </Text>
      </View>
    </TouchableOpacity>
  );  

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/home")}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reserve Court</Text>
        <UserAvatar size={36} />
      </View>

      {/* Search bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search Place Name/ Location/ Court Type"
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* Preferred Place Title */}
      <Text style={styles.sectionTitle}>Preferred Place</Text>

      {/* Loading & Error states */}
      {preferredStatus === "loading" && (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      )}
      {preferredStatus === "error" && (
        <Text style={{ color: "red", marginTop: 20 }}>
          Failed to fetch places.  
          <Text onPress={refetch} style={{ color: "blue" }}>Retry</Text>
        </Text>
      )}

      {/* List */}
      {preferredStatus === "success" && (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  searchInput: {
    height: 40,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 1,
  },
  image: {
    width: 110,
    height: 90,
  },
  infoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  location: {
    color: "#666",
    fontSize: 14,
    marginBottom: 4,
  },
  details: {
    color: "#333",
    fontSize: 14,
  },
});

export default ReserveCourtScreen;