import ShowInvitations from '@/components/player-invitations/ShowInvitations';
import ShowSentInvitations from '@/components/player-invitations/ShowSentInvitations';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

const PlayerInvitations = () => {
  const { type } = useLocalSearchParams(); // e.g., type=incoming or type=outgoing

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollArea}>
        {type === 'incoming' ? <ShowInvitations /> : <ShowSentInvitations />}
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
