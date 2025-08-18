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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
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

        const dobArray = profileData.dateOfBirth;
        const dobISO = Array.isArray(dobArray)
          ? new Date(dobArray[0], dobArray[1] - 1, dobArray[2]).toISOString().split('T')[0]
          : profileData.dateOfBirth;

        setUserData({
          name: profileData.name || '',
          email: profileData.email || '',
          profilePicture: profileData.profilePicture || '',
          address: profileData.address || '',
          city: profileData.city || '',
          state: profileData.state || '',
          country: profileData.country || '',
          zipCode: profileData.zipCode || '',
          dateOfBirth: dobISO || '',
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

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      const iso = selectedDate.toISOString().split('T')[0];
      //console.log('📅 Selected DOB:', iso);
      setUserData((prev) => ({ ...prev, dateOfBirth: iso }));
    }
  };

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

      const dobParts = userData.dateOfBirth.split('-');
      const formattedDOB = [parseInt(dobParts[0]), parseInt(dobParts[1]), parseInt(dobParts[2])];

      // Step 2: Construct payload
      const payload = {
        name: userData.name,
        email: userData.email,
        profilePicture: userData.profilePicture, 
        phoneNumber: userData.phoneNumber,
        dateOfBirth: formattedDOB,
        gender: userData.gender,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        country: userData.country,
        zipCode: userData.zipCode,
        playerDetails: {
          personalRating: userData.skillLevel,
          isAppDownloaded: true,
        },
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
    <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.replace('/(authenticated)/profile')}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#cce5e3" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Edit Profile</Text>
        {/* Placeholder for right side to center title */}
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
            <Ionicons name="pencil" size={18} color="#2F7C83" />
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
        style={styles.input}
        value={userData.zipCode}
        onChangeText={(text) => setUserData({ ...userData, zipCode: text })}
        placeholder="Enter Zip Code"
        keyboardType="number-pad"
        />

        <Text style={styles.label}>Date Of Birth</Text>
        <View
          style={[styles.dateInput,styles.readOnlyInput]}
          // onPress={() => setShowDatePicker(true)}
        >
          <Text style={userData.dateOfBirth ? styles.dateText : styles.placeholderText}>
            {userData.dateOfBirth || 'Enter Date of birth'}
          </Text>
          {/* <Ionicons name="calendar" size={20} color="#8C8C8C" /> */}
        </View>
        {/* {showDatePicker && (
          <DateTimePicker
            value={userData.dateOfBirth ? new Date(userData.dateOfBirth) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )} */}

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

        <Text style={styles.label}>Minimum Skill Level</Text>
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
    backgroundColor: '#2F7C83',
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
    backgroundColor: '#2F7C83',
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
    backgroundColor: '#f3f2f7',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    elevation: 3,
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
    color: '#3E6370',
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
    backgroundColor: '#2F7C83',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    marginBottom: 32,
    elevation: 2,
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
    backgroundColor: '#2F7C83',
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