import { usePlayersNearby } from "@/hooks/apis/players-nearby/usePlayersNearby";
import { RootState } from "@/store";
import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";

const MapComponent = React.memo(
  ({
    mapRefInstance,
    onMarkerPress,
    markers,
  }: {
    mapRefInstance: React.RefObject<MapView | null>;
    onMarkerPress: (marker: any) => void;
    markers: any[];
  }) => {
    const [positions, setPositions] = useState<
      { [key: string]: { x: number; y: number } }
    >({});
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const updatePositions = async () => {
      if (!mapRefInstance.current) return;
      const newPositions: { [key: string]: { x: number; y: number } } = {};
      for (const m of markers) {
        try {
          const point = await mapRefInstance.current.pointForCoordinate({
            latitude: m.lat,
            longitude: m.lng,
          });
          if (point) {
            newPositions[m.key] = {
              x: point.x - offset.x,
              y: point.y - offset.y,
            };
          }
        } catch (e) {}
      }
      setPositions(newPositions);
    };

    useEffect(() => {
      updatePositions();
    }, [markers, offset]);

    return (
      <View
        style={{ flex: 1 }}
        onLayout={(e) => {
          const { x, y } = e.nativeEvent.layout;
          setOffset({ x, y });
        }}
      >
        <MapView
          ref={mapRefInstance}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: markers[0]?.lat ?? 40.73,
            longitude: markers[0]?.lng ?? -74.06,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          onRegionChangeComplete={updatePositions}
        >
          {markers.map((marker) => (
            <Marker
              key={marker.key}
              coordinate={{ latitude: marker.lat, longitude: marker.lng }}
              onPress={() => onMarkerPress(marker)}
            >
              <Icon name="map-marker" size={36} color="red" />
            </Marker>
          ))}
        </MapView>

        {markers.map(
          (marker) =>
            positions[marker.key] && (
              <Text
                key={`label-${marker.key}`}
                style={[
                  styles.label,
                  {
                    left: positions[marker.key].x - 40,
                    top: positions[marker.key].y - 30,
                  },
                ]}
              >
                {marker.clubName}
              </Text>
            )
        )}
      </View>
    );
  }
);

const Overlay = ({ marker, onClose }) => {
  if (!marker) return null;
  return (
    <View style={styles.overlay}>
      <View style={styles.overlayCard}>
        <View style={styles.overlayHeader}>
          <Text style={styles.overlayTitle}>📍 {marker.clubName}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={20} color="#333" />
          </TouchableOpacity>
        </View>
        <Text style={styles.overlaySubtitle}>👤 {marker.contactName}</Text>
        <ScrollView style={{ maxHeight: 150 }}>
          {marker.bookings.map((b, i) => (
            <Text key={i} style={styles.overlayText}>
              📅 {b.date} | ⏰ {b.startTime.hour}:
              {String(b.startTime.minute).padStart(2, "0")} - {b.endTime.hour}:
              {String(b.endTime.minute).padStart(2, "0")}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

// --- Main Component ---
const PlayersNearbyMap = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, error } = usePlayersNearby(user?.userId, 3);
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);

  const mapRef = useRef<MapView>(null);
  const fullscreenMapRef = useRef<MapView>(null);

  const markers = (data || []).flatMap((contact) =>
    contact.bookings.map((club) => ({
      key: `${club.clubName}-${contact.preferredContactUserId}`,
      lat: club.clubLat,
      lng: club.clubLong,
      clubName: club.clubName,
      contactName: contact.preferredContactName,
      bookings: club.bookingDetails,
    }))
  );

  const shouldShowNoData =
    error || !data || data.length === 0 || markers.length === 0;

  const handleMarkerPress = useCallback((marker: any) => {
    setSelectedMarker(marker);
  }, []);

  return (
    <View style={{ height: 300, borderRadius: 12, overflow: "hidden" }}>
      <TouchableOpacity
        onPress={() => setFullscreen(true)}
        style={styles.expandButton}
      >
        <Icon name="arrow-expand" size={24} color="#333" />
      </TouchableOpacity>

      {shouldShowNoData && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            ⚠️ No bookings for preferred contacts found
          </Text>
        </View>
      )}

      {/* Small Map */}
      <MapComponent
        mapRefInstance={mapRef}
        onMarkerPress={handleMarkerPress}
        markers={markers}
      />

      {/* Overlay */}
      <Overlay marker={selectedMarker} onClose={() => setSelectedMarker(null)} />

      {/* Fullscreen Map */}
      <Modal visible={fullscreen} animationType="slide">
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => setFullscreen(false)}
            style={styles.closeButton}
          >
            <Icon name="close" size={28} color="#333" />
          </TouchableOpacity>

          <MapComponent
            mapRefInstance={fullscreenMapRef}
            onMarkerPress={handleMarkerPress}
            markers={markers}
          />

          <Overlay
            marker={selectedMarker}
            onClose={() => setSelectedMarker(null)}
          />
        </View>
      </Modal>
    </View>
  );
};

MapComponent.displayName = "MapComponent";
export default PlayersNearbyMap;

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
  banner: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    zIndex: 999,
    backgroundColor: "#fff3cd",
    padding: 10,
    borderRadius: 8,
    borderColor: "#ffeeba",
    borderWidth: 1,
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
  label: {
    position: "absolute",
    backgroundColor: "white",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "600",
    elevation: 4, // Android shadow
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
