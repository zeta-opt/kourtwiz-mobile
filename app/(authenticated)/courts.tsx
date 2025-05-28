import AddCourtsModal from '@/components/courts/AddCourtsModal';
import { useGetClubCourt } from '@/hooks/apis/courts/useGetClubCourts';
import LoaderScreen from '@/shared/components/Loader/LoaderScreen';
import ViewOnlyList from '@/shared/components/ViewOnlyList/ViewOnlyList';
import { RootState } from '@/store';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useSelector } from 'react-redux';

export default function Courts() {
  const [modalVisible, setModalVisible] = useState(false);
  const [columns, setColumn] = useState<string[]>([
    'name',
    'surface',
    'interval',
  ]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);

  const { user } = useSelector((state: RootState) => state.auth);
  const clubId = user?.currentActiveClubId;
  const { data: courts, status, refetch } = useGetClubCourt({ clubId });

  const handleAddUser = (data: any) => {
    setModalVisible(false);
  };

  useEffect(() => {
    if (!courts || courts.length === 0) return;
    setColumn(['name', 'surface', 'interval']);
    const resDataRows = courts.map((court) => ({
      name: String(court.name),
      surface: String(court.surface),
      interval: String(court.reservationIntervalMinutes),
    }));
    setRows(resDataRows);
  }, [clubId, courts]);

  if (status === 'loading') return <LoaderScreen />;

  return (
    <View style={styles.container}>
      <AddCourtsModal
        visible={modalVisible}
        refetch={refetch}
        onDismiss={() => setModalVisible(false)}
        currentClubId={clubId}
        onSubmit={handleAddUser}
      />
      <View style={styles.header}>
        <Text style={styles.title}>Courts</Text>
        <Button mode='contained' onPress={() => setModalVisible(true)}>
          Add
        </Button>
      </View>
      <ViewOnlyList
          columns={columns}
          rows={rows}
          modalTitle='Court details'
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 5 },
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
