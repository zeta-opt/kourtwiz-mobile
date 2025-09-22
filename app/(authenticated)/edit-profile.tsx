import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import Constants from 'expo-constants';
import { getToken } from '@/shared/helpers/storeToken';
import { useUpdateUserById } from '@/hooks/apis/user/useUpdateUserById';
import UserAvatar from '@/assets/UserAvatar';
import * as ImagePicker from 'expo-image-picker';
import { Avatar } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { logout, setProfileImage as setProfileImageAction } from '@/store/authSlice';
import {
  sendEmailOtp,
  sendPhoneOtp,
  validateEmailOtp,
  validatePhoneOtp,
} from "@/components/signup/api/api";

const GENDER_OPTIONS = ['Male', 'Female', 'NIL'];

const EditProfile = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    profilePicture: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    skillLevel: 0,
  });

  const [originalData, setOriginalData] = useState({
    email: '',
    phoneNumber: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const { updateUserById} = useUpdateUserById();
  const [zipError, setZipError] = useState<string>("");
  
  const [emailVerified, setEmailVerified] = useState(true);
  const [phoneVerified, setPhoneVerified] = useState(true);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailEdited, setEmailEdited] = useState(false);
  const [phoneEdited, setPhoneEdited] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to update your profile picture.');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
  
    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
  
      // Update preview + update in payload later
      setProfileImage(uri);
      dispatch(setProfileImageAction(uri));
      setUserData((prev) => ({ ...prev, profilePicture: base64Image }));
    }
  };
  const handleRemoveProfileImage = () => {
    setProfileImage(null);
    setUserData((prev) => ({ ...prev, profilePicture: '' }));
    dispatch(setProfileImageAction(''));
  }; 

  const fetchLocationByZip = async (zipCode: string) => {
    if (!zipCode || zipCode.length < 5) {
      setZipError("ZIP code must be 5 digits");
      return;
    }

    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      if (!response.ok) {
        setZipError("Invalid ZIP code or no data found");
        return;
      }

      const data = await response.json();
      const place = data.places?.[0];

      if (place) {
        setUserData((prev) => ({
          ...prev,
          city: place["place name"] || prev.city,
          state: place["state abbreviation"] || prev.state,
          country: data["country abbreviation"] || prev.country,
          zipCode: zipCode,
        }));
        setZipError("");
      } else {
        setZipError("No location found for this ZIP");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      setZipError("Something went wrong. Try again.");
    }
  }; 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await getToken();

        const meRes = await fetch(`${BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: '*/*',
          },
        });

        if (!meRes.ok) throw new Error('Failed to get user');
        const meData = await meRes.json();
        setUserId(meData.userId);

        const profileRes = await fetch(`${BASE_URL}/users/${meData.userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: '*/*',
          },
        });

        if (!profileRes.ok) throw new Error('Failed to fetch full profile');

        const profileData = await profileRes.json();
        console.log(profileData)

        let dobUS = '';
        if (Array.isArray(profileData.dateOfBirth)) {
          const [year, month, day] = profileData.dateOfBirth;
          dobUS = new Date(year, month - 1, day).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric"
          });
        } else if (typeof profileData.dateOfBirth === 'string' && profileData.dateOfBirth) {
          dobUS = new Date(profileData.dateOfBirth).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric"
          })}

        setUserData({
          name: profileData.name || '',
          email: profileData.email || '',
          profilePicture: profileData.profilePicture || '',
          address: profileData.address || '',
          city: profileData.city || '',
          state: profileData.state || '',
          country: profileData.country || '',
          zipCode: profileData.zipCode || '',
          dateOfBirth: dobUS || '',
          gender: profileData.gender || '',
          phoneNumber: profileData.phoneNumber || '',
          skillLevel: profileData.playerDetails?.personalRating ?? 0,
        });

        setOriginalData({
          email: profileData.email || '',
          phoneNumber: profileData.phoneNumber || '',
        });

        dispatch(setProfileImageAction(profileData.profilePicture));
        setProfileImage(profileData.profilePicture);

      } catch (err) {
        console.error('Error loading user profile:', err);
        Alert.alert('Error', 'Failed to load user details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [BASE_URL]);

  useEffect(() => {
    if (!originalData.email && !originalData.phoneNumber) return;

    if (userData.email.trim() !== originalData.email.trim()) {
      setEmailVerified(false);
      setEmailEdited(true);
    } else {
      setEmailEdited(false);
    }

    if (userData.phoneNumber.trim() !== originalData.phoneNumber.trim()) {
      setPhoneVerified(false);
      setPhoneEdited(true);
    } else {
      setPhoneEdited(false);
    }
  },[userData.email, userData.phoneNumber, originalData.email, originalData.phoneNumber]);

  // Email OTP send function (with validation like VerifyStep)
  const handleSendEmailOtp = async () => {
    if (!userData.email || !/^\S+@\S+\.\S+$/.test(userData.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    try {
      await sendEmailOtp(userData.email);
      setEmailOtpSent(true);
      Alert.alert("OTP Sent", "Check your email for the verification code.");
    } catch (err) {
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    }
  };

  // Email OTP verify function
  const handleVerifyEmailOtp = async () => {
    if (!emailOtp) {
      Alert.alert("Enter OTP", "Please enter the OTP sent to your email.");
      return;
    }
    try {
      await validateEmailOtp(userData.email, emailOtp);
      setEmailVerified(true);
      setEmailOtpSent(false);
      Alert.alert("Email verified successfully!");
    } catch (err) {
      Alert.alert("Error", "Invalid or expired OTP.");
    }
  };

  // Phone OTP send function (with validation like VerifyStep)
  const handleSendPhoneOtp = async () => {
    try {
      await sendPhoneOtp(userData.phoneNumber);
      setPhoneOtpSent(true);
      Alert.alert("OTP Sent", "Check your phone for the verification code.");
    } catch (err) {
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    }
  };

  // Phone OTP verify function
  const handleVerifyPhoneOtp = async () => {
    if (!phoneOtp) {
      Alert.alert("Enter OTP", "Please enter the OTP sent to your phone.");
      return;
    }
    try {
      await validatePhoneOtp(userData.phoneNumber, phoneOtp);
      setPhoneVerified(true);
      setPhoneOtpSent(false);
      Alert.alert("Phone verified successfully!");
    } catch (err) {
      Alert.alert("Error", "Invalid or expired OTP.");
    }
  };

  const handleSave = async () => {
    if (emailEdited && !emailVerified) {
      Alert.alert("Please verify your email before saving");
      return;
    }
    if (phoneEdited && !phoneVerified) {
      Alert.alert("Please verify your phone number before saving");
      return;
    }

    try {
      const token = await getToken();
  
      // Step 1: Get user ID from /users/me
      const meRes = await fetch(`${BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!meRes.ok) throw new Error('Failed to get user ID');
  
      const meData = await meRes.json();
      const userId = meData.userId;

      // Step 2: Construct payload
      const payload = {
        id: userId,
        name: userData.name,
        email: userData.email,
        profilePicture: userData.profilePicture,
        phoneNumber: userData.phoneNumber,
        gender: userData.gender,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        country: userData.country,
        zipCode: userData.zipCode,
        skillLevel: userData.skillLevel,
        isAppDownloaded: true,

        playerDetails: {
          personalRating: userData.skillLevel,
          preferToPlayWith: [],
          preferNotToPlayWith: [],
          preferPlacesToPlay: [],
          playedWithBefore: []
        }
      };

      console.log(payload)
      // Step 3: PUT request to update user profile
      await updateUserById(userId, payload);
      console.log(payload)

      setOriginalData({
        email: userData.email,
        phoneNumber: userData.phoneNumber,
      });
  
      if (emailEdited || phoneEdited) {
        Alert.alert(
          "Login Required",
          "You have to login again since you have changed your email ID or phone number.",
          [
            {
              text: "OK",
              onPress: () => {
                dispatch(logout());
                router.replace("/");
              }
            }
          ]
        );
      } else {
        Alert.alert("Success", "Your profile has been updated!");
        router.replace("/(authenticated)/profile");
      }

    } catch (err) {
      console.error('Error updating profile:', err);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.replace('/(authenticated)/profile')}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#cce5e3" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Edit Profile</Text>
        <View style={styles.backButton} />
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarCircle}>
          <TouchableOpacity onPress={pickImage}>
            {profileImage ? (
              <Avatar.Image size={70} source={{ uri: profileImage }} />
            ) : (
              <UserAvatar size={70} onPress={() => {}} />
            )}
          </TouchableOpacity>

          {/* Pencil Icon */}
          <TouchableOpacity style={styles.editAvatarIcon} onPress={pickImage}>
            <Ionicons name="pencil" size={18} color="#2C7E88" />
          </TouchableOpacity>
        </View>

        {/* Remove Image Button - Show only when image exists */}
        {profileImage ? (
          <TouchableOpacity
            onPress={handleRemoveProfileImage}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>Remove Image</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Form Fields */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={userData.name}
          placeholder="Enter Username"
          placeholderTextColor="#a0a0a0"
          onChangeText={(text) => setUserData({ ...userData, name: text })}
        />

        {/* Email Verification */}
        <Text style={styles.label}>Email Id</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={userData.email}
            onChangeText={(text) => {
              setUserData({ ...userData, email: text });
              setEmailVerified(false);
              setEmailOtpSent(false);
              setEmailOtp("");
            }}
            placeholder="Enter Email"
            keyboardType="email-address"
          />

          {userData.email !== originalData.email && !emailVerified && (
            <>
              {!emailOtpSent ? (
                <TouchableOpacity style={styles.verifyBtn} onPress={handleSendEmailOtp}>
                  <Text style={styles.verifyBtnText}>Send OTP</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TextInput
                    style={[styles.input, { flex: 1, marginLeft: 8 }]}
                    placeholder="Enter OTP"
                    value={emailOtp}
                    onChangeText={setEmailOtp}
                    keyboardType="number-pad"
                  />
                  <TouchableOpacity style={styles.verifyBtn} onPress={handleVerifyEmailOtp}>
                    <Text style={styles.verifyBtnText}>Verify</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.verifyBtn, { marginLeft: 5 }]} onPress={handleSendEmailOtp}>
                    <Text style={styles.verifyBtnText}>Resend</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>

        <Text style={styles.label}>Street Address</Text>
        <TextInput
        style={styles.input}
        value={userData.address}
        onChangeText={(text) => setUserData({ ...userData, address: text })}
        placeholder="Enter Street Address"
        />

        <Text style={styles.label}>City</Text>
        <TextInput
        style={styles.input}
        value={userData.city}
        onChangeText={(text) => setUserData({ ...userData, city: text })}
        placeholder="Enter City"
        />

        <Text style={styles.label}>State</Text>
        <TextInput
        style={styles.input}
        value={userData.state}
        onChangeText={(text) => setUserData({ ...userData, state: text })}
        placeholder="Enter State"
        />

        <Text style={styles.label}>Country</Text>
        <TextInput
        style={styles.input}
        value={userData.country}
        onChangeText={(text) => setUserData({ ...userData, country: text })}
        placeholder="Enter Country"
        />

        <Text style={styles.label}>Zip Code</Text>
        <TextInput
          style={[
            styles.input,
            zipError ? { borderColor: "red", borderWidth: 1 } : {},
          ]}
          value={userData.zipCode}
          onChangeText={(text) => {
            setUserData({ ...userData, zipCode: text });
            if (text.length === 5) {
              fetchLocationByZip(text);
            } else {
              setZipError("");
            }
          }}
          placeholder="Enter 5-digit Zip Code"
          keyboardType="number-pad"
        />

        {zipError ? (
          <Text style={{ fontSize: 12, color: "red", marginTop: 4 }}>
            {zipError}
          </Text>
        ) : (
          <Text style={{ fontSize: 12, color: "gray", marginTop: 4 }}>
            Auto-fill will trigger after entering 5 digits
          </Text>
        )}

        <Text style={styles.label}>Date Of Birth</Text>
        <View style={[styles.dateInput,styles.readOnlyInput]}>
          <Text style={userData.dateOfBirth ? styles.dateText : styles.placeholderText}>
            {userData.dateOfBirth || "MM/DD/YYYY"}
          </Text>
        </View>

        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderContainer}>
          {GENDER_OPTIONS.map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.genderButton,
                userData.gender === gender && styles.genderButtonSelected,
              ]}
              onPress={() => setUserData({ ...userData, gender })}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  userData.gender === gender && styles.genderButtonTextSelected,
                ]}
              >
                {gender}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Phone Verification */}
        <Text style={styles.label}>Phone No</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={userData.phoneNumber}
            onChangeText={(text) => {
              setUserData({ ...userData, phoneNumber: text });
              setPhoneVerified(false);
              setPhoneOtpSent(false);
              setPhoneOtp("");
            }}
            placeholder="Enter Phone"
            keyboardType="phone-pad"
          />

            {userData.phoneNumber !== originalData.phoneNumber && !phoneVerified && (
              <>
                {!phoneOtpSent ? (
                  <TouchableOpacity style={styles.verifyBtn} onPress={handleSendPhoneOtp}>
                    <Text style={styles.verifyBtnText}>Send OTP</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TextInput
                      style={[styles.input, { flex: 1, marginLeft: 8 }]}
                      placeholder="Enter OTP"
                      value={phoneOtp}
                      onChangeText={setPhoneOtp}
                      keyboardType="number-pad"
                    />
                    <TouchableOpacity style={styles.verifyBtn} onPress={handleVerifyPhoneOtp}>
                      <Text style={styles.verifyBtnText}>Verify</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.verifyBtn, { marginLeft: 5 }]} onPress={handleSendPhoneOtp}>
                      <Text style={styles.verifyBtnText}>Resend</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>

        <Text style={styles.label}>Self-Assessed Skill Level</Text>
        <View style={styles.sliderContainer}>
          <Slider
            style={{ flex: 1 }}
            minimumValue={1}
            maximumValue={6}
            step={0.1}
            value={userData.skillLevel}
            minimumTrackTintColor='#3E6370'
            maximumTrackTintColor="#d3d3d3"
            thumbTintColor='#3E6370'
            onValueChange={(value) => setUserData({ ...userData, skillLevel: value })}
          />
          <Text style={styles.skillLevelText}>{userData.skillLevel.toFixed(1)}</Text>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Update Profile</Text>
      </TouchableOpacity>
    </ScrollView>
    {/* Loader Overlay */}
    {loading && (
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.3)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
  )}
  </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  modalContent: {
    paddingBottom: 30,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  headerContainer: {
    backgroundColor: '#2C7E88',
    height: 80,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  avatarContainer: {
    backgroundColor: '#2C7E88',
    alignItems: 'center',
    marginTop: -30,
    marginBottom: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 40,
    marginBottom: 40,
  },
  editAvatarIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: 'lightgrey',
    borderRadius: 20,
    padding: 5,
  },
  removeButton: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },  
  formContainer: {
    backgroundColor: '#F3F2F7',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    color: 'black',
    marginTop: 8,
    marginBottom: 2,
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'black',
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#333',
  },
  readOnlyInput: {
    backgroundColor: '#F0F0F0',
    color: '#888',
  },
  multilineInput: {
    height: 80,
  },
  dateInput: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  genderButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#B9D7D9',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  genderButtonText: {
    color: '#3E6370',
    fontWeight: '600',
    fontSize: 14,
  },
  genderButtonSelected: {
    borderWidth: 2,
    borderColor:'#3E6370',
    fontWeight: '600',
    fontSize: 14,
  },
  genderButtonTextSelected: {
    color: '#3E6370',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  skillLevelText: {
    width: 40,
    textAlign: 'center',
    color: '#3E6370',
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#2C7E88',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 16,
    marginVertical: 32,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '400',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 1,
  },
  verifyBtn: {
    marginLeft: 8,
    backgroundColor: '#2C7E88',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  verifyBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});