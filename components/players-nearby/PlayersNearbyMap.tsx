import { usePlayersNearby } from '@/hooks/apis/players-nearby/usePlayersNearby';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// 🔹 Utility: sort bookings by date & time
const sortBookings = (bookings: any[]) => {
  return bookings.sort((a, b) => {
    const aTime = new Date(
      `${a.date}T${String(a.startTime.hour).padStart(2, '0')}:${String(
        a.startTime.minute
      ).padStart(2, '0')}`
    );
    const bTime = new Date(
      `${b.date}T${String(b.startTime.hour).padStart(2, '0')}:${String(
        b.startTime.minute
      ).padStart(2, '0')}`
    );
    return aTime.getTime() - bTime.getTime();
  });
};

const PlayersNearbyMap = () => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [radius, setRadius] = useState<number | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    'granted' | 'denied' | 'undetermined'
  >('undetermined');

  const { data } = usePlayersNearby({
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    radius,
  });

  const [fullscreen, setFullscreen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<any>(null);

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setPermissionStatus('denied');
      return;
    }
    setPermissionStatus('granted');
    const loc = await Location.getCurrentPositionAsync({});
    setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    setRadius(20);
  };

  const onRegionChangeComplete = (region: Region) => {
    setCoords({ lat: region.latitude, lng: region.longitude });
    setRadius(Math.round(region.latitudeDelta * 111)); // approx km radius
  };

  // 🔹 Group data into clubs
  const clubs = Object.values(
    (data || []).reduce((acc: any, player: any) => {
      player.bookings.forEach((club: any) => {
        const clubId = `${club.clubName}-${club.clubLat}-${club.clubLong}`;

        if (!acc[clubId]) {
          acc[clubId] = {
            clubId,
            clubName: club.clubName,
            lat: club.clubLat,
            lng: club.clubLong,
            players: [],
          };
        }

        // Check if player already exists in this club
        let existingPlayer = acc[clubId].players.find(
          (p: any) => p.playerUserId === player.playerUserId
        );

        if (!existingPlayer) {
          existingPlayer = {
            playerUserId: player.playerUserId,
            playerName: player.playerName,
            bookings: [],
          };
          acc[clubId].players.push(existingPlayer);
        }

        // Add bookings and sort
        existingPlayer.bookings.push(...club.bookingDetails);
        existingPlayer.bookings = sortBookings(existingPlayer.bookings);
      });
      return acc;
    }, {})
  );

  const handleMarkerPress = useCallback(
    (club: any) => setSelectedClub(club),
    []
  );

  useEffect(() => {
    if (permissionStatus === 'undetermined') requestLocation();
  }, []);

  return (
    <View style={{ height: 300, borderRadius: 12, overflow: 'hidden' }}>
      {permissionStatus === 'denied' && (
        <View style={styles.permissionBanner}>
          <Text style={styles.bannerText}>
            ⚠️ Location access needed to show nearby players
          </Text>
          <TouchableOpacity
            onPressIn={() => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }}
            style={styles.allowButton}
          >
            <Text style={{ color: 'white' }}>Allow</Text>
          </TouchableOpacity>
        </View>
      )}

      {coords && (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: coords.lat,
            longitude: coords.lng,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          onRegionChangeComplete={onRegionChangeComplete}
          showsUserLocation
        >
          {clubs.map((club: any) => (
            <Marker
              key={club.clubId}
              coordinate={{ latitude: club.lat, longitude: club.lng }}
              onPress={() => handleMarkerPress(club)}
            >
              {/* Custom Marker */}
              <View style={styles.markerContainer}>
                <View style={styles.arrowBox}>
                  {Platform.OS === 'android' && (
                    <Text style={styles.markerTextAndroid}>
                      {club.players.length + '\n'}
                      {club.players.length === 1 ? 'player' : 'players'}
                    </Text>
                  )}
                  {Platform.OS === 'ios' && (
                    <Text style={styles.markerText}>
                      {club.players.length}{' '}
                      {club.players.length === 1 ? 'player' : 'players'}
                    </Text>
                  )}
                </View>
                <View style={styles.arrowDown} />
              </View>
            </Marker>
          ))}
        </MapView>
      )}

      {/* Overlay for selected club */}
      {selectedClub && !fullscreen && (
        <View style={styles.overlay}>
          <OverlayContent
            club={selectedClub}
            close={() => setSelectedClub(null)}
          />
        </View>
      )}

      {/* Expand button */}
      <TouchableOpacity
        onPress={() => setFullscreen(true)}
        style={styles.expandButton}
      >
        <Icon name="arrow-expand" size={24} color="#333" />
      </TouchableOpacity>

      {/* Fullscreen Map */}
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
              style={{ flex: 1 }}
              initialRegion={{
                latitude: coords.lat,
                longitude: coords.lng,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }}
              onRegionChangeComplete={onRegionChangeComplete}
              showsUserLocation
            >
              {clubs.map((club: any) => (
                <Marker
                  key={`full-${club.clubId}`}
                  coordinate={{ latitude: club.lat, longitude: club.lng }}
                  onPress={() => handleMarkerPress(club)}
                >
                  <View style={styles.markerContainer}>
                    <View style={styles.arrowBox}>
                      {Platform.OS === 'android' && (
                        <Text style={styles.markerTextAndroid}>
                          {club.players.length + '\n'}
                          {club.players.length === 1 ? 'player' : 'players'}
                        </Text>
                      )}
                      {Platform.OS === 'ios' && (
                        <Text style={styles.markerText}>
                          {club.players.length}{' '}
                          {club.players.length === 1 ? 'player' : 'players'}
                        </Text>
                      )}
                    </View>
                    <View style={styles.arrowDown} />
                  </View>
                </Marker>
              ))}
            </MapView>
          )}

          {selectedClub && fullscreen && (
            <View style={styles.overlay}>
              <OverlayContent
                club={selectedClub}
                close={() => setSelectedClub(null)}
              />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default PlayersNearbyMap;

// 🔹 Overlay shows club players + bookings
const OverlayContent = ({ club, close }: { club: any; close: () => void }) => (
  <View style={styles.overlayCard}>
    <View style={styles.overlayHeader}>
      <Text style={styles.overlayTitle}>📍 {club.clubName}</Text>
      <TouchableOpacity onPress={close}>
        <Icon name="close" size={20} color="#333" />
      </TouchableOpacity>
    </View>

    <ScrollView style={{ maxHeight: 200 }}>
      {club.players.map((p: any, idx: number) => (
        <View key={`${p.playerUserId}-${idx}`} style={{ marginVertical: 6 }}>
          <Text style={styles.overlaySubtitle}>👤 {p.playerName}</Text>
          {p.bookings.map((b: any, i: number) => (
            <Text
              key={`${p.playerUserId}-booking-${i}`}
              style={styles.overlayText}
            >
              📅 {b.date} | ⏰ {b.startTime.hour}:
              {String(b.startTime.minute).padStart(2, '0')} - {b.endTime.hour}:
              {String(b.endTime.minute).padStart(2, '0')}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  markerContainer: { alignItems: 'center' },
  expandButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 999,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 999,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },
  permissionBanner: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 999,
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 8,
    borderColor: '#ffeeba',
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    maxWidth: '90%',
  },
  allowButton: {
    marginTop: 5,
    backgroundColor: '#007bff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  bannerText: { color: '#856404', fontWeight: '600' },
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  overlayCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overlayTitle: { fontSize: 16, fontWeight: 'bold' },
  overlaySubtitle: { marginVertical: 4, color: '#555' },
  overlayText: { fontSize: 14, marginVertical: 2 },
  arrowBox: {
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderColor: '#ccc',
    borderWidth: 1,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  markerText: { fontSize: 12, fontWeight: '600' },
  markerTextAndroid: {
    fontSize: 8,
    fontWeight: '500',
    textAlign: 'center',
    includeFontPadding: false,
  },
  arrowDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
    marginTop: -1,
  },
});
