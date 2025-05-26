import MembershipCards from '@/components/membership-plans/MembershipCards';
import { RootState } from '@/store';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useSelector } from 'react-redux';

export default function MembershipPlans() {
  const { user } = useSelector((state: RootState) => state.auth);
  const currentClubId = user?.currentActiveClubId;

  const [modalVisible, setModalVisible] = useState(false);

  console.log('modal : ', modalVisible, currentClubId);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Memberships</Text>
        <Button mode='contained' onPress={() => setModalVisible(true)}>
          Add
        </Button>
      </View>
      <MembershipCards currentClubId={currentClubId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 5 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20%',
    marginBottom: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
