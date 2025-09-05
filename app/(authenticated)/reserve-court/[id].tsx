import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useSearchImport } from '@/hooks/apis/iwanttoplay/useSearchImport';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import UserAvatar from '@/assets/UserAvatar';

const amenitiesLabels: Record<string, string> = {
  'Non-Slip Courts': 'Non-Slip Courts',
  'Shaded Seating': 'Shaded Seating',
  'LED Lights': 'LED Lights',
  Washrooms: 'Washrooms',
  'Water Stations': 'Water Stations',
};

export default function PlaceDetailsScreen() {
  const { id, name } = useLocalSearchParams<{ id: string, name: string }>();
  const { user } = useSelector((state: RootState) => state.auth);
  console.log('PlaceDetailsScreen id:', id, "Name:", name);

  // Fetch place data
  const { data, status, error } = useSearchImport({
    search: name || '',
    userId: user?.userId,
  });
  console.log("SearchImport status:", status, "data:", data, "error:", error);


  const place = useMemo(() => {
    if (!data?.content) return null;
    return data.content.find((p: any) => String(p.id) === String(id));
  }, [data, id]);  

  if (status === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (status === 'error' || !place) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>{error || 'Place not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{place.Name}</Text>
        <UserAvatar size={32} />
      </View>

      {/* Top Image */}
      <View>
      <Image
          source={require("@/assets/images/FindPlayerCardImage.png")}
          style={styles.topImage}
          resizeMode="cover"
        />
        <View style={styles.reservationTagContainer}>
          <Text style={styles.reservationTagText}>
            {place.Access || 'No Access Info'}
          </Text>
        </View>
      </View>

      {/* Title + Rating */}
      <View style={styles.titleContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.placeName}>{place.Name.toUpperCase()}</Text>
          <Text style={styles.placeSubInfo}>{place['Court Purpose']}</Text>
          <Text style={styles.placeSubInfo}>{place['Court Type']}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>4.5</Text>
          <Text style={styles.ratingStar}>★</Text>
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About {place.Name}</Text>
        <Text style={styles.aboutText}>
          {place.Location
            ? `This court is located at ${place.Location}.`
            : "Location details are not available."}
          {"\n"}
          {place.Access
            ? `It has ${place.Access}.`
            : "Access details are not specified."}
          {"\n"}
          {place.Lighting
            ? `Lighting: ${place.Lighting}.`
            : "Lighting information is not available."}
        </Text>
      </View>

      {/* Amenities (mock since API doesn’t provide) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amenities</Text>
        <View style={styles.amenitiesContainer}>
          {['Water Station', 'Shaded Seating'].map((amenity) => (
            <View key={amenity} style={styles.amenityBadge}>
              <Text style={styles.amenityText}>
                {amenitiesLabels[amenity] || amenity}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: place.Latitude,
            longitude: place.Longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: place.Latitude,
              longitude: place.Longitude,
            }}
            title={place.Name}
            description={place.Location}
          />
        </MapView>
        <Text style={styles.addressText}>{place.Location}</Text>
      </View>

      {/* Reserve Button */}
      <TouchableOpacity
        style={styles.reserveButton}
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: "/(authenticated)/book-court/[id]", params: { id, name } })}
      >
        <Text style={styles.reserveButtonText}>Reserve</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    centered: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    header: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      borderBottomColor: '#DDD',
      borderBottomWidth: 1,
    },
    backButton: {
      paddingRight: 16,
      paddingVertical: 8,
    },
    backButtonText: {
      fontSize: 24,
      color: '#000',
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      color: '#000',
    },
    profileImage: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    topImage: {
      width: screenWidth,
      height: 200,
    },
    reservationTagContainer: {
      position: 'absolute',
      top: 12,
      left: 12,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    reservationTagText: {
      color: '#FFF',
      fontWeight: '600',
      fontSize: 12,
    },
    titleContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      alignItems: 'center',
    },
    placeName: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 4,
    },
    placeSubInfo: {
      fontSize: 14,
      color: '#666',
      marginBottom: 2,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#E6E6E6',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    ratingText: {
      fontWeight: '700',
      fontSize: 16,
      marginRight: 4,
    },
    ratingStar: {
      color: '#f1c40f',
      fontSize: 16,
    },
    section: {
      paddingHorizontal: 16,
      marginTop: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 8,
    },
    aboutText: {
      fontSize: 14,
      lineHeight: 20,
      color: '#333',
    },
    photoThumbnail: {
      width: 120,
      height: 80,
      borderRadius: 8,
      marginRight: 12,
    },
    amenitiesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    amenityBadge: {
      backgroundColor: '#F0F0F0',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 8,
    },
    amenityText: {
      fontSize: 12,
      color: '#333',
    },
    map: {
      width: '100%',
      height: 150,
      borderRadius: 12,
    },
    addressText: {
      marginTop: 8,
      fontSize: 14,
      color: '#555',
      lineHeight: 20,
    },
    reserveButton: {
      marginHorizontal: 16,
      marginTop: 24,
      backgroundColor: '#2E7D32',
      borderRadius: 30,
      paddingVertical: 14,
      alignItems: 'center',
    },
    reserveButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '700',
    },
  });  