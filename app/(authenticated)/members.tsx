import AddMembershipModal from '@/components/Memberships/AddMembershipModal';
import { useGetUsersByclubId } from '@/hooks/apis/user/useGetUsersByClubId';
import LoaderScreen from '@/shared/components/Loader/LoaderScreen';
import ViewOnlyList from '@/shared/components/ViewOnlyList/ViewOnlyList';
import { RootState } from '@/store';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useSelector } from 'react-redux';

export default function Members() {
  const { user } = useSelector((state: RootState) => state.auth);
  const currentClubId = user?.currentActiveClubId;
  const { status, data, refetch } = useGetUsersByclubId({
    clubId: currentClubId,
  });
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddUser = (data: any) => {
    setModalVisible(false);
  };

  const [columns, setColumn] = useState<string[]>([
    'name',
    'email',
    'phoneNumber',
    'role',
    'tasks',
    'address',
    'city',
    'membership',
  ]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    setColumn([
      'name',
      'email',
      'phoneNumber',
      'role',
      'tasks',
      'address',
      'city',
      'membership',
    ]);

    const filteredUsers = data?.filter((user: any) => {
      if (!user || !user.role) return false;
      return user?.role?.name !== 'ClubAdmin';
    });
    
    const resDataRows = filteredUsers?.map((filUser) => ({
      name: String(filUser?.user?.name),
      email: String(filUser?.user?.email),
      phoneNumber: String(filUser?.user?.phoneNumber),
      role: String(filUser.role?.name),
      tasks:
        filUser.user?.tasks?.length > 0
          ? filUser?.user?.tasks?.join(' ,')
          : 'No tasks',
      address: String(filUser?.user?.address) || 'NA',
      city: String(filUser?.user?.city) || 'NA',
      membership: String(filUser?.membershipPlan?.membershipName) || 'N/A',
    }));

    setRows(resDataRows);
  }, [currentClubId, data]);

  if (status === 'loading') return <LoaderScreen />;

  return (
    <View style={styles.container}>
      <AddMembershipModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        onSubmit={handleAddUser}
        currentClubId={currentClubId}
        refetch={refetch}
      />
      <View style={styles.header}>
        <Text style={styles.title}>Club Members</Text>
        <Button mode='contained' onPress={() => setModalVisible(true)}>
          Add User
        </Button>
      </View>
      <ViewOnlyList
          columns={columns}
          rows={rows}
          modalTitle='User details'
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '5%',
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
