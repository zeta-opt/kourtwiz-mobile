import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useSelector } from 'react-redux';

import { useGetMembershipsByClubId } from '@/hooks/apis/memberships/useGetmembershipsByClubId';
import MembershipCards from '@/components/membership-plans/MembershipCards';
import {MembershipForm} from '@/components/membership-plans/MembershipForm';
import { RootState } from '@/store';

export default function MembershipPlans() {
  const { user } = useSelector((state: RootState) => state.auth);
  const currentClubId = user?.currentActiveClubId;

  const [showForm, setShowForm] = useState(false);
  const {
    data: clubMembershipData = [],
    status,
    refetch,
  } = useGetMembershipsByClubId(currentClubId ?? '');
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Memberships</Text>
        <Button mode='contained' onPress={() => setShowForm(true)}>
          Add
        </Button>
      </View>

      {/* Membership Cards */}
      <MembershipCards
        currentClubId={currentClubId}
        data={clubMembershipData ?? []}
        status={status}
      />
      {showForm && (
        <MembershipForm
          visible={showForm}
          currentClubId={currentClubId}
          refetch={refetch}
          clubId={currentClubId}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            refetch();        
            setShowForm(false);
          }}
        />
      )}
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
