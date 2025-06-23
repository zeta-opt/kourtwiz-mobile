import { getToken, storeToken } from "@/shared/helpers/storeToken";
import  Constants  from "expo-constants";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const UserProfile = () => {
  type Place = { id: string; name: string };
  const [preferredPlaces, setPreferredPlaces] = useState<Place[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    preferredTime: "",
    userId: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [suggestedPlaces, setSuggestedPlaces] = useState<Place[]>([]);
  const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

  useEffect(() => {
    const loginAndGetToken = async () => {
      try {
        const loginRes = await fetch(`${BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "bharat.g@zetaopt.com",
            password: "Test@12345",
          }),
        });
        const loginJson = await loginRes.json();
        await storeToken(loginJson.token);
        return loginJson.token;
      } catch {
        throw new Error("Failed to login and get token");
      }
    };

    const fetchProfile = async () => {
      try {
        let token = await getToken();
        console.log("🔐 Token:", token);

        let meRes = await fetch(`${BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!meRes.ok) {
          console.warn("/me failed, trying login...");
          token = await loginAndGetToken();
          meRes = await fetch(`${BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        const meData = await meRes.json();
        console.log("✅ /me data:", meData);

        setUserData((prev) => ({
          ...prev,
          name: meData.username || "",
          userId: meData.userId,
          email: meData.email,
        }));

        const profileRes = await fetch(
          `${BASE_URL}/users/${meData.userId}`
        );
        if (!profileRes.ok) throw new Error("/users/:id failed");
        const profileDetails = await profileRes.json();
        setUserData((prev) => ({ ...prev, ...profileDetails }));

        const placesRes = await fetch(
          `${BASE_URL}/users/preferredPlacesToPlay?id=${meData.userId}`
        );
        const raw = await placesRes.text();

        let places = [];
        try {
          places = JSON.parse(raw);
        } catch (e) {
          console.warn("❌ Failed to parse preferred places JSON:", e);
        }

        if (!places || !places.length) {
          const addressParams = new URLSearchParams({
            address: profileDetails.address || "6 Parkwood Lane",
            city: profileDetails.city || "Mendham",
            state: profileDetails.state || "New Jersey",
            zipCode: profileDetails.zipCode || "07945",
            country: profileDetails.country || "United States",
            maxDistanceInKm: "5",
            page: "0",
            limit: "10",
          }).toString();

          const nearbyRes = await fetch(
            `${BASE_URL}/api/import/nearbyaddress?${addressParams}`
          );
          if (!nearbyRes.ok) throw new Error("Nearby places fetch failed");
          const nearby = await nearbyRes.json();
          setSuggestedPlaces(nearby);
        } else {
          setPreferredPlaces(places);
        }
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
        Alert.alert("Error", "Failed to load profile. Please try again.");
      }
    };

    fetchProfile();
  }, [BASE_URL]);

  const handleSelectPlace = (placeId:string) => {
    setSelectedPlaces((prev) =>
      prev.includes(placeId)
        ? prev.filter((id) => id !== placeId)
        : [...prev, placeId]
    );
  };

  const handleSavePlaces = async () => {
    try {
      const token = await getToken();
      const payload = {
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        playerDetails: {
          preferPlacesToPlay: selectedPlaces.map((id) => ({ id })),
          isAppDownloaded: true,
          personalRating: 3,
        },
      };

      const response = await fetch(
        `${BASE_URL}/users/${userData.userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to update preferred place");

      Alert.alert("Success", "Preferred places saved");
      setShowModal(false);
    } catch (err) {
      console.error("❌ Failed to update preferred place:", err);
      Alert.alert("Error", "Could not save preferred place");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Basic Info</Text>
        <Text>Name: {userData.name}</Text>
        <Text>Email: {userData.email}</Text>
        <Text>Phone: {userData.phoneNumber}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Address</Text>
        <Text>{userData.address}</Text>
        <Text>
          {userData.city}, {userData.state}
        </Text>
        <Text>
          {userData.country} - {userData.zipCode}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <Text>DOB: {userData.dateOfBirth}</Text>
        <Text>Gender: {userData.gender}</Text>
        <Text>Preferred Time: {userData.preferredTime}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Preferred Places</Text>
        {preferredPlaces.length > 0 ? (
          preferredPlaces.map((place) => (
            <Text key={place.id}>- {place.name}</Text>
          ))
        ) : (
          <View>
            <Text>No preferred places found.</Text>
            {suggestedPlaces.length > 0 && (
              <Button
                title="Add Preferred Places"
                onPress={() => setShowModal(true)}
              />
            )}
          </View>
        )}
      </View>

      <Modal
        visible={showModal}
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              margin: 20,
              padding: 20,
              borderRadius: 10,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
            >
              Select Preferred Places
            </Text>
            {suggestedPlaces.map((place) => (
              <TouchableOpacity
                key={place.id}
                style={{
                  padding: 10,
                  backgroundColor: selectedPlaces.includes(place.id)
                    ? "#d0f0c0"
                    : "transparent",
                }}
                onPress={() => handleSelectPlace(place.id)}
              >
                <Text>{place.name || "Unnamed Place"}</Text>
              </TouchableOpacity>
            ))}
            <Button title="Save" onPress={handleSavePlaces} />
            <Button
              title="Cancel"
              color="red"
              onPress={() => setShowModal(false)}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F9F9F9",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
});
