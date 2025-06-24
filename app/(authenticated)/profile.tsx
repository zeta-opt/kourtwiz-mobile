import { getToken, storeToken } from "@/shared/helpers/storeToken";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { useUpdateUserById } from "@/hooks/apis/user/useUpdateUserById";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

const UserProfile = () => {
  const [preferredPlaces, setPreferredPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
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

  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [suggestedPlaces, setSuggestedPlaces] = useState([]);

  const { updateUserById } = useUpdateUserById();

  useEffect(() => {
    const loginAndGetToken = async () => {
      try {
        const loginRes = await fetch("http://44.216.113.234:8080/login", {
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
      } catch (err) {
        throw new Error("Failed to login and get token");
      }
    };

    const fetchProfile = async () => {
      try {
        let token = await getToken();
        console.log("🔐 Token:", token);

        let meRes = await fetch("http://44.216.113.234:8080/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!meRes.ok) {
          console.warn("/me failed, trying login...");
          token = await loginAndGetToken();
          meRes = await fetch("http://44.216.113.234:8080/users/me", {
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

        const profileRes = await fetch(`http://44.216.113.234:8080/users/${meData.userId}`);
        if (!profileRes.ok) throw new Error("/users/:id failed");
        const profileDetails = await profileRes.json();
        setUserData((prev) => ({ ...prev, ...profileDetails }));

        const placesRes = await fetch(
          `http://44.216.113.234:8080/users/preferredPlacesToPlay?id=${meData.userId}`
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
            `http://44.216.113.234:8080/api/import/nearbyaddress?${addressParams}`
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
  }, []);

  const handleSelectPlace = (placeId) => {
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

      const response = await fetch(`http://44.216.113.234:8080/users/${userData.userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update preferred place");

      Alert.alert("Success", "Preferred places saved");
      setShowPlaceModal(false);
    } catch (err) {
      console.error("❌ Failed to update preferred place:", err);
      Alert.alert("Error", "Could not save preferred place");
    }
  };

  const handleUpdateUser = async () => {
    const {
      name,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      country,
      zipCode,
      preferredTime,
    } = userData;

    try {
      await updateUserById(userData.userId, {
        name,
        dateOfBirth,
        gender,
        address,
        city,
        state,
        country,
        zipCode,
        preferredTime,
      });

      Alert.alert("Success", "Profile updated successfully");
      setShowUpdateModal(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const iso = selectedDate.toISOString().split("T")[0];
      setUserData((prev) => ({ ...prev, dateOfBirth: iso }));
    }
  };

  const formatDateOfBirth = (dob) => {
    try {
      if (!dob) return "N/A";
      const date = new Date(dob);
      if (isNaN(date.getTime())) return dob;
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dob;
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
        <Text>{userData.city}, {userData.state}</Text>
        <Text>{userData.country} - {userData.zipCode}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <Text>DOB: {formatDateOfBirth(userData.dateOfBirth)}</Text>
        <Text>Gender: {userData.gender}</Text>
        <Text>Preferred Time: {userData.preferredTime}</Text>
      </View>

      <View style={styles.card}>
        <Button title="Update Profile Details" onPress={() => setShowUpdateModal(true)} />
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
              <Button title="Add Preferred Places" onPress={() => setShowPlaceModal(true)} />
            )}
          </View>
        )}
      </View>

      {/* Update Modal */}
      <Modal visible={showUpdateModal} transparent onRequestClose={() => setShowUpdateModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalWrapper}>
            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Update Profile</Text>

              <Text style={styles.label}>Email</Text>
              <TextInput style={[styles.input, styles.readOnlyInput]} value={userData.email} editable={false} />

              <Text style={styles.label}>Phone Number</Text>
              <TextInput style={[styles.input, styles.readOnlyInput]} value={userData.phoneNumber} editable={false} />

              <Text style={styles.label}>Name</Text>
              <TextInput style={styles.input} value={userData.name} onChangeText={(text) => setUserData({ ...userData, name: text })} />

              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                <Text>{userData.dateOfBirth || "Select Date"}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={userData.dateOfBirth ? new Date(userData.dateOfBirth) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}

              <Text style={styles.label}>Gender</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={userData.gender}
                  onValueChange={(value) => setUserData({ ...userData, gender: value })}
                  mode="dropdown"
                >
                  <Picker.Item label="Select Gender" value="" />
                  <Picker.Item label="Male" value="Male" />
                  <Picker.Item label="Female" value="Female" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>

              {["address", "city", "state", "country", "zipCode", "preferredTime"].map((field) => (
                <React.Fragment key={field}>
                  <Text style={styles.label}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
                  <TextInput
                    style={styles.input}
                    value={userData[field]}
                    onChangeText={(text) => setUserData({ ...userData, [field]: text })}
                  />
                </React.Fragment>
              ))}

              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateUser}>
                <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowUpdateModal(false)}>
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
            </ScrollView>
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
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalWrapper: {
    width: "90%",
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  label: {
    fontWeight: "600",
    marginBottom: 1,
    marginTop: 6,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#fff",
    marginBottom: 3,
  },
  readOnlyInput: {
    backgroundColor: "#eee",
    color: "#666",
  },
  pickerWrapper: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 4,
  },
  saveButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 6,
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
