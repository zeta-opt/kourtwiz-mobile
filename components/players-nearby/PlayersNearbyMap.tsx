import { usePlayersNearby } from "@/hooks/apis/players-nearby/usePlayersNearby";
import { RootState } from "@/store";
import React, { useRef, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";

const PlayersNearbyMap = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, error } = usePlayersNearby(user?.userId, 3);
  const [fullscreen, setFullscreen] = useState(false);

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

  const zoomToFitMarkers = (ref: React.RefObject<MapView | null>) => {
    if (ref.current && markers.length > 1) {
      ref.current.fitToCoordinates(
        markers.map((m) => ({
          latitude: m.lat,
          longitude: m.lng,
        })),
        {
          edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
          animated: true,
        }
      );
    }
  };

  const MapComponent = ({
    mapRefInstance,
    onMapReadyZoom = false,
  }: {
    mapRefInstance: React.RefObject<MapView | null>;
    onMapReadyZoom?: boolean;
  }) => (
    <MapView
      ref={mapRefInstance}
      style={{ flex: 1 }}
      onMapReady={() => {
        if (onMapReadyZoom) zoomToFitMarkers(mapRefInstance);
      }}
      initialRegion={{
        latitude: markers[0]?.lat ?? 40.73,
        longitude: markers[0]?.lng ?? -74.06,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.key}
          coordinate={{ latitude: marker.lat, longitude: marker.lng }}
        >
          <View style={styles.markerContainer}>
            <Text style={styles.markerLabel}>{marker.clubName}</Text>
            <View style={styles.pin} />
          </View>

          <Callout style={{ width: 220 }}>
            <Text style={{ fontWeight: "bold" }}>
              <Icon name="map-marker" size={16} color="#4a4a4a" />
              {marker.clubName}
            </Text>
            <Text>
              <Icon name="account" size={14} color="#888" />
              <Text style={{ textDecorationLine: "underline" }}>
                {marker.contactName}
              </Text>
            </Text>
            {marker.bookings.map((b, i) => (
              <Text key={i}>
                <Icon name="calendar" size={14} color="#444" />
                {b.date} | <Icon name="clock" size={14} color="#444" />
                {b.startTime.hour}:{String(b.startTime.minute).padStart(2, "0")}{" "}
                - {b.endTime.hour}:{String(b.endTime.minute).padStart(2, "0")}
              </Text>
            ))}
          </Callout>
        </Marker>
      ))}
    </MapView>
  );

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
          <Text style={styles.bannerText}>⚠️ No bookings for preferred contacts found</Text>
        </View>
      )}

      <MapComponent mapRefInstance={mapRef} onMapReadyZoom />

      <Modal visible={fullscreen} animationType="slide">
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => setFullscreen(false)}
            style={styles.closeButton}
          >
            <Icon name="close" size={28} color="#333" />
          </TouchableOpacity>
          <MapComponent mapRefInstance={fullscreenMapRef} onMapReadyZoom />
        </View>
      </Modal>
    </View>
  );
};

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
  markerContainer: {
    alignItems: "center",
  },
  markerLabel: {
    backgroundColor: "white",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  pin: {
    width: 10,
    height: 10,
    backgroundColor: "red",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#fff",
  },
});
