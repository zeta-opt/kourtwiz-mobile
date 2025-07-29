import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, TextStyle } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'expo-router';
import { getToken } from '@/shared/helpers/storeToken';
import Constants from 'expo-constants';

type UserAvatarProps = {
  size?: number;
  showInitials?: boolean;
  onPress?: () => void;
  labelStyle?: TextStyle; // <-- Custom font size, weight etc.
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  size = 42,
  showInitials = true,
  onPress,
  labelStyle,
}) => {
  const profileImage = useSelector((state: RootState) => state.auth.profileImage);
  const [remoteProfileImage, setRemoteProfileImage] = useState<string | null>(null);  
  const finalImage = profileImage || remoteProfileImage;
  const user = useSelector((state: RootState) => state.auth.user);
  const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
  const router = useRouter();

  const initials =
    user?.username
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase() || 'U';

  
    useEffect(() => {
      const fetchProfileImage = async () => {
        if (!profileImage) {
          const token = await getToken();
          const res = await fetch(`${BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setRemoteProfileImage(data.profilePicture);
        }
      };
    
      fetchProfileImage();
    }, [profileImage]);
    
    const handlePress = () => {
      if (onPress) onPress();
      else router.push('/(authenticated)/profile');
    };

  // Default font size based on avatar size (optional fallback logic)
  const getDefaultFontSize = () => {
    if (size >= 70) return 24;
    if (size >= 50) return 18;
    return 14;
  };

  if (profileImage) {
    return <Avatar.Image size={size} source={{ uri: profileImage }} />;
  }
  return (
    <TouchableOpacity onPress={handlePress}>
      {finalImage ? (
        <Avatar.Image size={size} source={{ uri: finalImage }} />
      ) : showInitials ? (
        <Avatar.Text
          size={size}
          label={initials}
          style={styles.avatar}
          labelStyle={labelStyle || { fontSize: getDefaultFontSize() }}
        />
      ) : null}
    </TouchableOpacity>
  );  
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: 'black',
  },
});

export default UserAvatar;
