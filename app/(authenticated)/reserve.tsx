import UserAvatar from '@/assets/UserAvatar';
import { useGetPreferredPlaces } from '@/hooks/apis/player-finder/useGetPreferredPlaces';
import { useGetSearchPlaces } from '@/hooks/apis/player-finder/useGetSearchPlaces';
import { useSearchImport } from '@/hooks/apis/iwanttoplay/useSearchImport';
import { RootState } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
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

const PAGE_SIZE = 20;

const ReserveCourtScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // ----- Local UI state
  const [searchText, setSearchText] = useState("");      // input box text
  const [searchQuery, setSearchQuery] = useState("");    // committed query (on Enter/icon)
  const [searchMode, setSearchMode] = useState(false);   // true when showing import-search results

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [page, setPage] = useState(0);
  const [nearbyAccumulated, setNearbyAccumulated] = useState<CourtData[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // ----- Preferred places
  const {
    data: preferredPlaces,
    status: preferredStatus,
  } = useGetPreferredPlaces({ userId: user?.userId });

  // ----- Nearby infinite scroll (default mode)
  const {
    data: nearbyPage,
    status: nearbyStatus,
  } = useGetSearchPlaces({
    userId: user?.userId,
    lat: coords?.lat ?? 0,
    lng: coords?.lng ?? 0,
    maxDistanceInKm: 30,
    page,
    limit: PAGE_SIZE,
  });

  // ----- Search-by-name (triggered on Enter or search icon)
  const {
    data: importSearchResults,
    status: importStatus,
    refetch: refetchImport,
  } = useSearchImport({
    search: searchMode ? searchQuery : "",   // call API only in search mode
    userId: user?.userId,
    page: 0,
    size: PAGE_SIZE,
  });

  // Get user location for nearby pagination
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

  // Normalize helpers
  const normalizeNearby = (item: any): CourtData => ({
    id: item?.id ?? item?.Name ?? String(Math.random()),
    name: item?.Name ?? item?.name ?? "",
    location: item?.Location ?? item?.Address ?? item?.location ?? "",
    courtType: item?.["Court Type"] ?? item?.courtType ?? "",
    courtPurpose: item?.["Court Purpose"] ?? item?.courtPurpose ?? "",
    distance: typeof item?.distance === "number" ? item.distance : undefined,
    isPreferred: false,
  });

  const normalizePreferred = (item: any): CourtData => ({
    id: item?.id,
    name: item?.name,
    location: item?.location,
    courtType: item?.courtType,
    courtPurpose: item?.courtPurpose,
    isPreferred: true,
  });

  // Safely convert various API response shapes to an array
  const toArray = (val: any): any[] => {
    if (Array.isArray(val)) return val;
    if (!val || typeof val !== "object") return [];
    if (Array.isArray(val.data)) return val.data;
    if (Array.isArray(val.content)) return val.content;
    if (Array.isArray(val.items)) return val.items;
    if (Array.isArray(val.results)) return val.results;
    return [];
  };

  // Append new nearby page when it arrives
  useEffect(() => {
    if (!nearbyPage || !coords) return;

    const preferredIds = new Set(preferredPlaces?.map(p => p.id) ?? []);
    const mapped = toArray(nearbyPage)
      .filter((x: any) => !preferredIds.has(x?.id))
      .map(normalizeNearby);

    setHasMore(mapped.length >= PAGE_SIZE);
    setNearbyAccumulated(prev => [
      ...prev,
      ...mapped.filter(p => !prev.some(x => x.id === p.id)),
    ]);
    setIsFetchingMore(false);
  }, [nearbyPage, coords, preferredPlaces]);

  // Combine preferred + nearby (default mode)
  const combinedDefault: CourtData[] = useMemo(() => ([
    ...(preferredPlaces?.map(normalizePreferred) ?? []),
    ...nearbyAccumulated,
  ]), [preferredPlaces, nearbyAccumulated]);

  // Normalize import search results (search mode)
  const searchResultsArray: CourtData[] = useMemo(() => {
    const arr = toArray(importSearchResults);
    return arr.map(normalizeNearby); // shape expected to match "import" items
  }, [importSearchResults]);

  // What to display now
  const dataToDisplay: CourtData[] = searchMode ? searchResultsArray : combinedDefault;

  // Load more nearby (only in default mode)
  const loadMore = () => {
    if (searchMode) return; // disable while searching by name
    if (hasMore && !isFetchingMore && nearbyStatus !== "loading") {
      setIsFetchingMore(true);
      setPage(prev => prev + 1);
    }
  };

  // Submit search (Enter or icon)
  const handleSearchSubmit = () => {
    const trimmed = searchText.trim();
    if (!trimmed) {
      // clear search and go back to default mode
      setSearchMode(false);
      setSearchQuery("");
      return;
    }
    setSearchQuery(trimmed);
    setSearchMode(true);
    Keyboard.dismiss();
    // Force a refetch even if the same term is submitted again
    setTimeout(() => {
      refetchImport();
    }, 0);
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
          (item.courtPurpose ?? "").toLowerCase().includes("pickleball")
            ? require("@/assets/images/pickleball_player.png")
            : require("@/assets/images/FindPlayerCardImage.png")
        }
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>
          {item.name} {item.isPreferred ? "⭐" : ""}
        </Text>
        {!!item.location && <Text style={styles.location}>{item.location}</Text>}
        <Text style={styles.details}>
          {item.courtType ?? ""}{item.courtPurpose ? ` | ${item.courtPurpose}` : ""}
        </Text>
        {typeof item.distance === "number" && (
          <Text style={styles.distance}>
            {item.distance < 1
              ? `${Math.round(item.distance * 1000)}m`
              : `${item.distance.toFixed(1)}km`}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const initialLoading =
    (preferredStatus === "loading" || nearbyStatus === "loading") && !searchMode;

  const searchLoading = searchMode && importStatus === "loading";

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

      {/* Search bar: name-only + submit on Enter or icon */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Place Name"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearchSubmit} // Enter key
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchText(""); setSearchMode(false); setSearchQuery(""); }}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleSearchSubmit} style={{ marginLeft: 8 }}>
          <Ionicons name="search" size={22} color="black" />
        </TouchableOpacity>
      </View>

      {/* List */}
      {(initialLoading || searchLoading) ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={dataToDisplay}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.6}
          ListFooterComponent={() =>
            !searchMode && isFetchingMore ? (
              <ActivityIndicator size="small" style={{ marginVertical: 16 }} />
            ) : null
          }
          ListEmptyComponent={() => (
            <View style={{ marginTop: 20, alignItems: "center" }}>
              <Text>No courts found.</Text>
            </View>
          )}
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
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 1,
  },
  image: { width: 110, height: 90 },
  infoContainer: { flex: 1, padding: 12, justifyContent: "center" },
  name: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  location: { color: "#666", fontSize: 14, marginBottom: 4 },
  details: { color: "#333", fontSize: 14 },
  distance: { color: "#999", fontSize: 12, marginTop: 2 },
});

export default ReserveCourtScreen;
