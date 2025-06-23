import React, { useContext } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Card, Button, TextInput, Title } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ThemeProfileSettings from '@/components/themes/ThemeProfileSettings';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';

const ThemesSettings = () => {
interface UserClubRole {
    clubId: string;
    clubName: string;
    // Add other properties if needed
}

interface User {
    currentActiveClubId?: string;
    userClubRole?: UserClubRole[];
    // Add other properties if needed
}

const { user }: { user?: User } = useSelector((state: RootState) => state.auth);

const selectedClubname: string | undefined = user?.userClubRole?.find(
    (club: UserClubRole) => club.clubId === user?.currentActiveClubId
)?.clubName;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.header}>Club Branding & Customization</Title>

      {/* Club Logo */}
      <Card style={styles.card}>
        <Card.Content>
          <Image source={require('@/assets/adminLogo.jpg')} style={styles.image} />
          <Text style={styles.description}>
            Upload your club logo. Recommended size: 512×512px, PNG or JPG format.
          </Text>
          <Button
            icon="upload"
            mode="contained"
            onPress={() => console.log('Upload Logo')}
          >
            Upload Logo
          </Button>
        </Card.Content>
      </Card>

      {/* Club Banner */}
      <Card style={styles.card}>
        <Card.Content>
          <Image source={require('@/assets/clubBannerLogo.jpg')} style={styles.banner} />
          <Text style={styles.description}>
            Upload a banner image for your club page. Recommended size: 1200×300px.
          </Text>
          <Button
            icon="upload"
            mode="contained"
            onPress={() => console.log('Upload Banner')}
          >
            Upload Banner
          </Button>
        </Card.Content>
      </Card>

      {/* Club Info */}
      <Title style={styles.subHeader}>Club Information</Title>

      <TextInput
        label="Club Name"
        mode="outlined"
        value={selectedClubname}
        style={styles.input}
        editable={false}
      />

      <TextInput
        label="Club Description"
        mode="outlined"
        multiline
        numberOfLines={4}
        defaultValue="A community of pickleball enthusiasts dedicated to promoting the sport and fostering competitive play in a friendly environment."
        style={styles.input}
      />

      <Title style={styles.subHeader}>Themes Settings</Title>
      <ThemeProfileSettings />
    </ScrollView>
  );
};

export default ThemesSettings;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 16,
  },
  subHeader: {
    marginTop: 24,
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
    borderRadius: 10,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  banner: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  description: {
    marginBottom: 10,
  },
  input: {
    marginTop: 12,
  },
});
