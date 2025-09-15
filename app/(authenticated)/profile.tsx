import { getToken, storeToken } from '@/shared/helpers/storeToken';
import { logout } from '@/store/authSlice';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserAvatar from '@/assets/UserAvatar';
import { useDeleteUserById } from '@/hooks/apis/user/useDeleteUserById';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { Avatar } from 'react-native-paper';
import VideoSubscriptionToggle from '@/components/profile/VideoSubscriptionToggle';

type PlayerDetails = {
  preferPlacesToPlay: { id: string }[];
  personalRating: number;
  duprRating?: number;
  playedWithBefore?: string[] | null;
  preferToPlayWith?: string[] | null;
  preferNotToPlayWith?: string[] | null;
};

type UserData = {
  name: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  preferredTime: string;
  skillLevel: string;
  userId: string;
  playerDetails: PlayerDetails;
  videoRecordingSubscribed?: boolean;
  isAppDownloaded: boolean;
};

const UserProfile = () => {
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    preferredTime: '',
    skillLevel: '',
    userId: '',
    playerDetails: {
      preferPlacesToPlay: [],
      personalRating: 0,
    },
    isAppDownloaded: false,
  });  
  
  const [modalVisible, setModalVisible] = useState(false);
  const { deleteUserById, status, error } = useDeleteUserById();
  const isLoading = status === 'loading';
  const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
  const dispatch = useDispatch();
  const router = useRouter();
  const profileImage = useSelector((state: RootState) => state.auth.profileImage);
  const InfoLoader = ({ value }: { value?: string | number }) => {
    if (value === undefined || value === null || value === "") {
      return <ActivityIndicator size="small" color="#2C7E88" />;
    }
    return <Text style={styles.inputReadonly}>{value}</Text>;
  };

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          dispatch(logout());
          router.replace('/');
        },
        style: 'destructive',
      },
    ]);
  };

  const handleDelete = async () => {
    if (!userData?.userId) {
      console.error("User ID not found.");
      return;
    }
  
    try {
      await deleteUserById(userData.userId);
  
      // Clear Redux user/auth state
      dispatch(logout());
  
      // Close modal and redirect
      setModalVisible(false);
      router.replace("/");
    } catch (error) {
      console.error("Failed to delete user:", error);
  
      // Optional: Show user-friendly error message
      Alert.alert("Error", "Something went wrong while deleting your account.");
    }
  };  

  useEffect(() => {
    const loginAndGetToken = async () => {
      try {
        const loginRes = await fetch(`${BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'bharat.g@zetaopt.com',
            password: 'Test@12345',
          }),
        });
        const loginJson = await loginRes.json();
        await storeToken(loginJson.token);
        return loginJson.token;
      } catch {
        throw new Error('Failed to login and get token');
      }
    };

    const fetchProfile = async () => {
      try {
        let token = await getToken();

        let meRes = await fetch(`${BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!meRes.ok) {
          token = await loginAndGetToken();
          meRes = await fetch(`${BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        const meData = await meRes.json();
        setUserData((prev) => ({
          ...prev,
          name: meData.username || '',
          userId: meData.userId,
          email: meData.email,
        }));

        const profileRes = await fetch(`${BASE_URL}/users/${meData.userId}`);
        if (!profileRes.ok) throw new Error('/users/:id failed');
        const profileDetails = await profileRes.json();
        console.log('📥 Fetched profileData:', profileDetails);
        const skillLevel = profileDetails?.playerDetails?.personalRating ?? 0;

        setUserData((prev) => ({
          ...prev,
          ...profileDetails,
          skillLevel,
        }));

      } catch (err) {
        console.error('Error fetching profile:', err);
        Alert.alert('Error', 'Failed to load profile. Please try again.');
      }
    };

    fetchProfile();
  }, [BASE_URL]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar backgroundColor="#87B9BC" barStyle="light-content" />

      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#cce5e3" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.header}>
        <View style={styles.profilePicContainer}>
          {profileImage ? (
            <Avatar.Image size={70} source={{ uri: profileImage }} />
          ) : (
            <UserAvatar size={70} onPress={() => {}} />
          )}
        </View>
        <View style={styles.profileInfo}>
          {userData.name ? (
            <Text style={styles.nameText}>{userData.name}</Text>
          ) : (
            <ActivityIndicator size="small" color="#fff" />
          )}
          {userData.email ? (
            <Text style={styles.emailText}>{userData.email}</Text>
          ) : (
            <ActivityIndicator size="small" color="#fff" />
          )}
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.replace('/(authenticated)/edit-profile')}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.DetailsCard}>
        <VideoSubscriptionToggle
          userId={userData.userId}
          initialSubscribed={userData.videoRecordingSubscribed}
          onSubscriptionChange={(newValue) =>
            setUserData((prev) => ({ ...prev, videoRecordingSubscribed: newValue }))
          }
        />
      </View>

      <Text style={[styles.sectionTitle,{ marginBottom: 0, marginLeft: 40, fontWeight: 600 },]}>
        PERSONAL DETAILS
      </Text>
      <View style={styles.DetailsCard}>
        {!userData || !userData.address ? (
          // Single loader for whole card
          <View style={{ padding: 20, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#2C7E88" />
          </View>
        ) : (
          <>
            {userData.address && (
              <>
                <Text style={styles.sectionTitle}>ADDRESS</Text>
                <InfoLoader
                  value={[
                    userData.address,
                    userData.city,
                    userData.state,
                    userData.country,
                    userData.zipCode,
                  ]
                    .filter((part) => part && part !== "null")
                    .join(", ")}
                />
              </>
            )}
            <Text style={styles.sectionTitle}>DOB</Text>
            <InfoLoader
              value={
                Array.isArray(userData.dateOfBirth)
                  ? `${String(userData.dateOfBirth[2]).padStart(2, "0")}/${String(
                      userData.dateOfBirth[1]
                    ).padStart(2, "0")}/${userData.dateOfBirth[0]}`
                  : new Date(userData.dateOfBirth).toLocaleDateString("en-GB")
              }
            />

            <Text style={styles.sectionTitle}>GENDER</Text>
            <InfoLoader value={userData.gender} />

            <Text style={styles.sectionTitle}>PHONE NO.</Text>
            <InfoLoader value={userData.phoneNumber} />

            <Text style={styles.sectionTitle}>SKILL RATING</Text>
            <Text style={[styles.inputReadonly, { backgroundColor: "#fffadc" }]}>
              {Number(userData.skillLevel ?? 1).toFixed(1)}
            </Text>
          </>
        )}
      </View>

      {/* PLAY PREFERENCES */}
      <View style={styles.DetailsCard}>
        <Text style={styles.sectionTitle}>PLAY PREFERENCES</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.optionRow} onPress={() => router.replace('/(authenticated)/preferred-places')}>
            <Text style={styles.optionText}>Preferred places</Text>
            <Text style={styles.optionArrow}>{'>'}</Text>
          </TouchableOpacity>

          <View style={styles.sectionDivider} />

            <TouchableOpacity
            style={styles.optionRow}
            onPress={() => {
              router.replace('/(authenticated)/preferred-time');
            }}
            >
            <Text style={styles.optionText}>Preferred time</Text>
            <Text style={styles.optionArrow}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* PREFERRED PLAYERS */}
        <Text style={styles.sectionTitle}>PREFFERED PLAYERS</Text>
        <View style={styles.sectionCard}>
        <TouchableOpacity 
          style={styles.optionRow} 
          onPress={() => {
            router.replace('/(authenticated)/preferred-players');
          }}
          >
          <Text style={styles.optionText}>Preferred Players</Text>
          <Text style={styles.optionArrow}>{'>'}</Text>
        </TouchableOpacity>
        </View>
        <Text style={styles.sectionHelperText}>
            Import contacts and invite friend to play KourtWiz with you.
        </Text>

        {/* CREATE GROUPS */}
        <Text style={styles.sectionTitle}>CREATE GROUPS</Text>
        <View style={styles.sectionCard}>
        <TouchableOpacity 
          style={styles.optionRow} 
          onPress={() => {
            router.replace('/(authenticated)/create-group');
          }}
          >
          <Text style={styles.optionText}>Create Group</Text>
          <Text style={styles.optionArrow}>{'>'}</Text>
        </TouchableOpacity>
        </View>
        <Text style={styles.sectionHelperText}>
            Import groups and invite friends to play KourtWiz with you.
        </Text>

        {/* AVOIDED PLAYERS */}
        {/* <Text style={styles.sectionTitle}>AVOIDED PLAYERS</Text>
        <View style={styles.sectionCard}>
        <TouchableOpacity style={styles.optionRow} onPress={() => {console.log('players avoideed')}}>
          <Text style={styles.optionText}>Avoided Players</Text>
          <Text style={styles.optionArrow}>{'>'}</Text>
        </TouchableOpacity>
        </View>
        <Text style={styles.sectionHelperText}>
            Avoid players you don’t enjoy playing with.
        </Text> */}
      </View>

      <View style={styles.DetailsCard}>
      {/* DELETE ACCOUNT SECTION */}
      <View style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>Delete Account</Text>
          <Text style={styles.actionArrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>
      
      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
          {error && (
            <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text>
          )}
            <View style={styles.iconWrapper}>
              <Ionicons name="trash" size={28} color="#FF3B30" />
            </View>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalDescription}>
              This action can’t be reversed. All the data associated with this account will be permanently deleted. Are you sure you want to proceed?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelDelete]}
                onPress={() => setModalVisible(false)}
                disabled={isLoading}
              >
                <Text style={[styles.buttonText, { color: '#4A4A4A' }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.buttonText, { color: '#fff' }]}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

        {/* LOGOUT BUTTON */}
        <View style={styles.sectionCard}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color='#FF3B30' style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },  
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#333',
  },
  readOnlyInput: {
    backgroundColor: '#F1F1F1',
    color: '#999',
  },
  modal_Overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modal_Container: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modal_Title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  timeOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginVertical: 5,
  },
  timeOptionSelected: {
    backgroundColor: '#2F7C83',
    borderColor: '#2F7C83',
  },
  timeOptionText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  timeOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#2F7C83',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    color: '#888',
    fontWeight: 'bold',
  },  
  headerContainer: {
    backgroundColor: '#2F7C83',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#F4F6F8',
    paddingBottom: 30,
  },
  // ===== HEADER & PROFILE SUMMARY =====
  header: {
    backgroundColor: '#2F7C83', // teal color background
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicContainer: {
    width: 74,
    height: 74,
    borderRadius: 37,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profilePicIcon: {
    color: '#87B9BC',
    fontSize: 32,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  editButton: {
    backgroundColor: '#60a4b4', // semi-transparent white
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
  },

  // ===== PERSONAL DETAILS CARD =====
  DetailsCard: {
    backgroundColor: '#f3f2f7',
    borderRadius: 18,
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#2F7C83',
    marginBottom: 10,
    marginTop: 12,
  },
  multiLineText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  inputReadonly: {
    fontSize: 14,
    color: '#333',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  // ===== SECTIONS (Play Pref / Players etc) =====
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom:10,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 8,
    paddingHorizontal: 8,
  },
  optionText: {
    fontSize: 15,
    color: '#333',
  },
  sectionHelperText: {
    fontSize: 13,
    color: '#2F7C83',
    paddingHorizontal: 8,
    marginBottom: 10,
  },

  // ===== ARROW ICON =====
  optionArrow: {
    fontSize: 22,
    fontWeight: '600',
    color: '#999',
  },

  // ===== DIVIDER =====
  sectionDivider: {
    height: 0.1,
    backgroundColor: 'black',
    marginVertical: 6,
  },

  // ===== DELETE ACCOUNT & LOGOUT =====
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '400',
  },
  actionArrow: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF3B30',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontWeight: '400',
    fontSize: 16,
    color: '#FF3B30',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '100%',
    paddingVertical: 30,
    paddingHorizontal: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  iconWrapper: {
    backgroundColor: '#FDECEA', // Light red background
    borderRadius: 50,
    padding: 14,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#4A4A4A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelDelete: {
    backgroundColor: '#F3F3F3',
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    marginLeft: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});