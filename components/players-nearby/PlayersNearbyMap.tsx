import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Linking,
  Platform,
} from "react-native";
import MapView, { Region } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Location from "expo-location";
import { usePlayersNearby } from "@/hooks/apis/players-nearby/usePlayersNearby";

const PlayersNearbyMap = () => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState<number | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    "granted" | "denied" | "undetermined"
  >("undetermined");

  const { data } = usePlayersNearby({
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    radius,
  });

  const mapRef = useRef<MapView>(null);
  const fullscreenMapRef = useRef<MapView>(null);

  const [positions, setPositions] = useState<any>({});
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setPermissionStatus("denied");
      return;
    }
    setPermissionStatus("granted");
    const loc = await Location.getCurrentPositionAsync({});
    setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    setRadius(20);
    
  };

  const onRegionChangeComplete = (region: Region) => {
    setCoords({ lat: region.latitude, lng: region.longitude });
    setRadius(Math.round(region.latitudeDelta * 111));
    updatePositions(region === undefined ? mapRef : fullscreenMapRef);
  };

  const updatePositions = async (ref: React.RefObject<MapView> | undefined) => {
    if (!ref?.current || !data) return;
    const newPositions: any = {};
    const markers = (data || []).flatMap((contact) =>
      contact.bookings.map((club: any) => ({
        key: `${club.clubName}-${contact.playerUserId}`,
        lat: club.clubLat,
        lng: club.clubLong,
        clubName: club.clubName,
        contactName: contact.playerName,
        playerUserId: contact.playerUserId,
        bookings: club.bookingDetails,
      }))
    );

    for (const m of markers) {
      try {
        const point = await ref.current.pointForCoordinate({
          latitude: m.lat,
          longitude: m.lng,
        });
        if (point) newPositions[m.key] = { x: point.x, y: point.y };
      } catch {}
    }
    setPositions(newPositions);
  };

  const markers =
    (data || []).flatMap((contact) =>
      contact.bookings.map((club: any) => ({
        key: `${club.clubName}-${contact.playerUserId}`,
        lat: club.clubLat,
        lng: club.clubLong,
        clubName: club.clubName,
        contactName: contact.playerName,
        playerUserId: contact.playerUserId,
        bookings: club.bookingDetails,
      }))
    ) ?? [];

    // Group players per club
    const playersPerClub: Record<string, Set<string>> = {};
    markers.forEach((m) => {
      if (!playersPerClub[m.clubName]) playersPerClub[m.clubName] = new Set();
      playersPerClub[m.clubName].add(m.playerUserId); // unique players
    });

  const handleMarkerPress = useCallback((marker: any) => setSelectedMarker(marker), []);

  useEffect(() => {
    if (permissionStatus === "undetermined") requestLocation();
  }, []);

  console.log("Markers:", markers);

  return (
    <View style={{ height: 300, borderRadius: 12, overflow: "hidden" }}>
      {permissionStatus === "denied" && (
        <View style={styles.permissionBanner}>
          <Text style={styles.bannerText}>
            ⚠️ Location access needed to show nearby players
          </Text>
          <TouchableOpacity
            onPressIn={() => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:"); // iOS
              } else {
                Linking.openSettings(); // Android
              }
            }}
            style={styles.allowButton}
          >
            <Text style={{ color: "white" }}>Allow</Text>
          </TouchableOpacity>
        </View>
      )}

      {coords && (
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={
            markers[0]
              ? {
                  latitude: coords.lat,
                  longitude: coords.lng,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                }
              : {
                  latitude: coords.lat,
                  longitude: coords.lng,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                }
          }
          onRegionChangeComplete={(region) => {
            updatePositions(mapRef);
            onRegionChangeComplete(region);
          }}
          showsUserLocation
        />
      )}

      {/* Player count arrow boxes */}
      {markers.map((marker) =>
        positions[marker.key] ? (
          <View
            key={`label-${marker.key}`}
            style={{
              position: "absolute",
              left: positions[marker.key].x - 30,
              top: positions[marker.key].y - 50,
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <View style={styles.arrowBox}>
              <Text style={styles.markerText} onPress={() => handleMarkerPress(marker)}>
                {playersPerClub[marker.clubName]?.size ?? 0}{" "}
                {playersPerClub[marker.clubName]?.size === 1 ? "player" : "players"}
              </Text>
            </View>
            <View style={styles.arrowDown} />
          </View>
        ) : null
      )}

      {/* Overlay for marker details (normal mode) */}
      {selectedMarker && !fullscreen && (
        <View style={styles.overlay}>
          <OverlayContent marker={selectedMarker} close={() => setSelectedMarker(null)} />
        </View>
      )}

      {/* Expand button */}
      <TouchableOpacity
        onPress={() => setFullscreen(true)}
        style={styles.expandButton}
      >
        <Icon name="arrow-expand" size={24} color="#333" />
      </TouchableOpacity>

      {/* Fullscreen map */}
      <Modal visible={fullscreen} animationType="slide">
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => setFullscreen(false)}
            style={styles.closeButton}
          >
            <Icon name="close" size={28} color="#333" />
          </TouchableOpacity>

          {coords && (
            <MapView
              ref={fullscreenMapRef}
              style={{ flex: 1 }}
              initialRegion={
                markers[0]
                  ? {
                      latitude: coords.lat,
                      longitude: coords.lng,
                      latitudeDelta: 0.1,
                      longitudeDelta: 0.1,
                    }
                  : {
                      latitude: coords.lat,
                      longitude: coords.lng,
                      latitudeDelta: 0.1,
                      longitudeDelta: 0.1,
                    }
              }
              onRegionChangeComplete={(region) => {
                updatePositions(fullscreenMapRef);
                onRegionChangeComplete(region);
              }}
              showsUserLocation
            />
          )}

          {/* Fullscreen labels */}
          {markers.map((marker) =>
            positions[marker.key] ? (
              <View
                key={`label-full-${marker.key}`}
                style={{
                  position: "absolute",
                  left: positions[marker.key].x - 30,
                  top: positions[marker.key].y - 50,
                  alignItems: "center",
                  zIndex: 10,
                }}
              >
                <View style={styles.arrowBox}>
                  <Text
                    style={styles.markerText}
                    onPress={() => handleMarkerPress(marker)}
                  >
                    {playersPerClub[marker.clubName]?.size ?? 0}{" "}
                    {playersPerClub[marker.clubName]?.size === 1 ? "player" : "players"}
                  </Text>
                </View>
                <View style={styles.arrowDown} />
              </View>
            ) : null
          )}

          {/* Overlay inside fullscreen */}
          {selectedMarker && fullscreen && (
            <View style={styles.overlay}>
              <OverlayContent marker={selectedMarker} close={() => setSelectedMarker(null)} />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default PlayersNearbyMap;

// Overlay component
const OverlayContent = ({ marker, close }: { marker: any; close: () => void }) => (
  <View style={styles.overlayCard}>
    <View style={styles.overlayHeader}>
      <Text style={styles.overlayTitle}>📍 {marker.clubName}</Text>
      <TouchableOpacity onPress={close}>
        <Icon name="close" size={20} color="#333" />
      </TouchableOpacity>
    </View>
    <Text style={styles.overlaySubtitle}>👤 {marker.contactName}</Text>
    <ScrollView style={{ maxHeight: 150 }}>
      {marker.bookings.map((b: any, i: number) => (
        <Text key={i} style={styles.overlayText}>
          📅 {b.date} | ⏰ {b.startTime.hour}:
          {String(b.startTime.minute).padStart(2, "0")} - {b.endTime.hour}:
          {String(b.endTime.minute).padStart(2, "0")}
        </Text>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  expandButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 999,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 999,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },
  permissionBanner: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    zIndex: 999,
    backgroundColor: "#fff3cd",
    padding: 10,
    borderRadius: 8,
    borderColor: "#ffeeba",
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    maxWidth: "90%",
  },
  allowButton: {
    marginTop: 5,
    backgroundColor: "#007bff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  bannerText: {
    color: "#856404",
    fontWeight: "600",
  },
  overlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  overlayCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  overlayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  overlayTitle: { fontSize: 16, fontWeight: "bold" },
  overlaySubtitle: { marginVertical: 4, color: "#555" },
  overlayText: { fontSize: 14, marginVertical: 2 },
  arrowBox: {
    backgroundColor: "white",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderColor: "#ccc",
    borderWidth: 1,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  markerText: {
    fontSize: 12,
    fontWeight: "600",
  },
  arrowDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "white",
    marginTop: -1,
  },
});
