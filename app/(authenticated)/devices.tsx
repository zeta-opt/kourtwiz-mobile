import { useGetClubDevice } from '@/hooks/apis/devices/useGetClubDevice';
import LoaderScreen from '@/shared/components/Loader/LoaderScreen';
import ViewOnlyList from '@/shared/components/ViewOnlyList/ViewOnlyList';
import { RootState } from '@/store';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Button } from 'react-native-paper';
import AddDeviceModal from '@/components/device/addDeviceModal';

export default function Devices() {
  const [modalVisible, setModalVisible] = useState(false);
  const [columns, setColumn] = useState<string[]>([
    'name',
    'type',
    'status',
  ]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  

  const { user } = useSelector((state: RootState) => state.auth);
  const clubId = user?.currentActiveClubId;
  const { data: devices, status, refetch } = useGetClubDevice({ clubId });

  useEffect(() => {
    if (!devices || devices.length === 0) return;
    const mappedRows = devices.map((device) => ({
      'name': String(device.name || 'N/A'),
      'type': String(device.type || 'N/A'),
      status: String(device.status || 'N/A'),
    }));
    setRows(mappedRows);
  }, [devices]);

  if (status === 'loading') return <LoaderScreen />;

  return (
    <View style={styles.container}>
      

      <AddDeviceModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        onSubmit={() => setModalVisible(false)}
        currentClubId={clubId}
        refetch={refetch}
      />
      <View style={styles.header}>
        <Text style={styles.title}>Devices</Text>
        <Button mode='contained' onPress={() => setModalVisible(true)}>
          Add Device
        </Button>
      </View>

      <ViewOnlyList columns={columns} rows={rows} modalTitle='Device Details' />
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
