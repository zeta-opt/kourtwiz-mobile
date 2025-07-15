import React from 'react';
import { StyleSheet, TouchableOpacity, TextStyle } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'expo-router';

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
  const profileImage = useSelector(
    (state: RootState) => state.auth.profileImage
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();

  const initials =
    user?.username
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase() || 'U';

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

  return (
    <TouchableOpacity onPress={handlePress}>
      {profileImage ? (
        <Avatar.Image size={size} source={{ uri: profileImage }} />
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
