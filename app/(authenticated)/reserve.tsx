import UserAvatar from '@/assets/UserAvatar';
import { useGetPreferredPlaces } from '@/hooks/apis/player-finder/useGetPreferredPlaces';
import { useGetSearchPlaces } from '@/hooks/apis/player-finder/useGetSearchPlaces';
import { RootState } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from "react";
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
import * as Location from 'expo-location';

type CourtData = {
  id: string;
  name: string;
  location?: string;
  courtType?: string;
  courtPurpose?: string;
  distance?: number;
  isPreferred?: boolean;
};

const ReserveCourtScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [page, setPage] = useState(0);
  const [places, setPlaces] = useState<CourtData[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);

  // Preferred places API
  const {
    data: preferredPlaces,
    status: preferredStatus,
  } = useGetPreferredPlaces({ userId: user?.userId });

  // Search places API
  const {
    data: searchPlaces,
    status: searchStatus,
    refetch,
  } = useGetSearchPlaces({
    userId: user?.userId,
    lat: coords?.lat ?? 0,
    lng: coords?.lng ?? 0,
    maxDistanceInKm: 30,
    page,
    limit: 20,
  });

  // Get user location on mount
  useEffect(() => {
    const getLocation = async () => {
      try {
        const location = await Location.getCurrentPositionAsync({});
        setCoords({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      } catch (err) {
        console.error("Error getting location:", err);
      }
    };
    getLocation();
  }, []);

  // Append new courts when searchPlaces changes
  useEffect(() => {
    if (searchPlaces && coords) {
      const preferredIds = new Set(preferredPlaces?.map(p => p.id) ?? []);
      const newPlaces: CourtData[] = searchPlaces
        .filter(court => !preferredIds.has(court.id))
        .map(court => ({
          id: court.id || court.Name,
          name: court.Name,
          location: court.Location,
          courtType: court["Court Type"],
          courtPurpose: court["Court Purpose"],
          distance: court.distance,
          isPreferred: false,
        }));

      setHasMore(newPlaces.length >= 20);
      setPlaces(prev =>
        [...prev, ...newPlaces.filter(p => !prev.some(x => x.id === p.id))]
      );
      setIsFetchingMore(false);
    }
  }, [searchPlaces]);

  const combinedPlaces: CourtData[] = [
    ...(preferredPlaces?.map(p => ({
      id: p.id,
      name: p.name,
      location: p.location,
      courtType: p.courtType,
      courtPurpose: p.courtPurpose,
      isPreferred: true,
    })) ?? []),
    ...places,
  ];

  // Search filtering
  const filteredData = combinedPlaces.filter(item => {
    const lowered = searchText.toLowerCase();
    return (
      item.name.toLowerCase().includes(lowered) ||
      item.location?.toLowerCase().includes(lowered) ||
      item.courtPurpose?.toLowerCase().includes(lowered)
    );
  });

  const loadMore = () => {
    if (hasMore && !isFetchingMore && searchStatus !== "loading") {
      setIsFetchingMore(true);
      setPage(prev => prev + 1);
    }
  };

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
          item.courtPurpose?.toLowerCase().includes("pickleball")
            ? require("@/assets/images/pickleball_player.png")
            : require("@/assets/images/FindPlayerCardImage.png")
        }
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>
          {item.name} {item.isPreferred && "⭐"}
        </Text>
        {item.location && <Text style={styles.location}>{item.location}</Text>}
        <Text style={styles.details}>
          {item.courtType ?? ""} {item.courtPurpose ? `| ${item.courtPurpose}` : ""}
        </Text>
        {item.distance !== undefined && (
          <Text style={styles.details}>
            {item.distance < 1
              ? `${Math.round(item.distance * 1000)}m`
              : `${item.distance.toFixed(1)}km`}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
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

      {/* List */}
      {(preferredStatus === "loading" || searchStatus === "loading") && page === 0 ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.6}
          ListFooterComponent={() =>
            isFetchingMore ? (
              <ActivityIndicator size="small" style={{ marginVertical: 16 }} />
            ) : null
          }
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