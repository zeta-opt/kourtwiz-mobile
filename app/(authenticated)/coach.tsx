import AddCoachModal from '@/components/coach/addCoachModal';
import { useGetClubCoach } from '@/hooks/apis/coach/useGetClubCoach';
import LoaderScreen from '@/shared/components/Loader/LoaderScreen';
import ViewOnlyTable from '@/shared/components/ViewOnlyTable/ViewOnlytable';
import { RootState } from '@/store';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useSelector } from 'react-redux';

export default function Coach() {
  const [modalVisible, setModalVisible] = useState(false);
  const [columns, setColumn] = useState<string[]>([
    'name',
    'email',
    'price per hour',
  ]);

  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);
  const clubId = user?.currentActiveClubId;
  const { data: coaches, status, refetch } = useGetClubCoach({ clubId });

  const handleAddCoach = (data: any) => {
    setModalVisible(false);
  };

  useEffect(() => {
    if (!coaches || coaches.length === 0) return;
    setColumn(['name', 'email', 'price per hour']);
    const resDataRows = coaches.map((coach) => ({
      name: String(coach.name),
      email: String(coach.email),
      'price per hour': String(coach.pricePerHour),
    }));
    setRows(resDataRows);
  }, [clubId, coaches]);

  if (status === 'loading') return <LoaderScreen />;

  return (
    <View style={styles.container}>
      <AddCoachModal
        visible={modalVisible}
        refetch={refetch}
        onDismiss={() => setModalVisible(false)}
        currentClubId={clubId}
        onSubmit={handleAddCoach}
      />
      <View style={styles.header}>
        <Text style={styles.title}>Coach</Text>
        <Button mode='contained' onPress={() => setModalVisible(true)}>
          Add
        </Button>
      </View>
      <ViewOnlyTable
        columns={columns}
        rows={rows}
        DEFAULT_COLUMN_WIDTH={150}
        modalTitle='Coach details'
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
