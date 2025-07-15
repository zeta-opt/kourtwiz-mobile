import ShowInvitations from '@/components/player-invitations/ShowInvitations';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';

const PlayerInvitations = () => {
  const { highlight } = useLocalSearchParams();
  return (
    <View style={styles.container}>
      
      <ScrollView style={styles.scrollArea}>
        <ShowInvitations />
      </ScrollView>
    </View>
  );
};

export default PlayerInvitations;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    // padding: 16,
    // backgroundColor: '#fff',
  },
  headerContainer: {
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  scrollArea: {
    flex: 1,
    marginBottom: 16,
  },
});
