import { useGetClubDevice } from '@/hooks/apis/devices/useGetClubDevice';
import { useDeleteClubDevice } from '@/hooks/apis/devices/useDelDevice';
import { useGetClubCourt } from '@/hooks/apis/courts/useGetClubCourts';
import LoaderScreen from '@/shared/components/Loader/LoaderScreen';
import ViewOnlyList from '@/shared/components/ViewOnlyList/ViewOnlyList';
import { RootState } from '@/store';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Button } from 'react-native-paper';
import AddDeviceModal from '@/components/device/addDeviceModal';
import { Picker } from '@react-native-picker/picker';

export default function Devices() {
  const [modalVisible, setModalVisible] = useState(false);
  const columns: string[] = ['name', 'type', 'status', 'court']; 
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string | ''>(''); 

  const { user } = useSelector((state: RootState) => state.auth);
  const clubId = user?.currentActiveClubId;

  const { data: devices, status, refetch } = useGetClubDevice({ clubId });
  const { data: rawCourts } = useGetClubCourt({ clubId: clubId! });
  const courts: Record<string, any>[] = rawCourts ?? [];

  const { deleteDevice } = useDeleteClubDevice();

  const getCourtName = (courtId: string) => {
    const court = courts.find(c => String(c.id) === String(courtId));
    return court ? court.name : 'N/A';
  };

  useEffect(() => {
    if (!devices) {
      setRows([]);
      return;
    }

    const filteredDevices =
      selectedCourtId !== ''
        ? devices.filter(device => String(device.courtId) === selectedCourtId)
        : devices;

    const mappedRows = filteredDevices.map(device => ({
      id: device.id,
      name: device.name || 'N/A',
      type: device.type || 'N/A',
      status: device.status || 'N/A',
      court: getCourtName(device.courtId),
    }));

    setRows(prevRows => {
      const isSame =
        prevRows.length === mappedRows.length &&
        prevRows.every((row, i) => JSON.stringify(row) === JSON.stringify(mappedRows[i]));
      return isSame ? prevRows : mappedRows;
    });
  }, [devices, courts, selectedCourtId]);

  const handleDelete = (row: Record<string, any>) => {
    Alert.alert(
      'Delete Device',
      `Are you sure you want to delete device "${row.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteDevice(
              { deviceId: row.id, clubId: clubId! },
              {
                onSuccess: () => {
                  refetch();
                },
                onError: (error: any) => {
                  Alert.alert('Error', error.message);
                },
              }
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (status === 'loading') return <LoaderScreen />;

  return (
    <View style={styles.container}>
      <AddDeviceModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        onSubmit={() => setModalVisible(false)}
        currentClubId={clubId!}
        refetch={refetch}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Devices</Text>
        <Button mode="contained" onPress={() => setModalVisible(true)}>
          Add Device
        </Button>
      </View>

      {/* Court Filter Dropdown */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Court:</Text>
        <Picker
          selectedValue={selectedCourtId}
          onValueChange={itemValue => setSelectedCourtId(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="All Courts" value="" />
          {courts.map(court => (
            <Picker.Item key={court.id} label={court.name} value={String(court.id)} />
          ))}
        </Picker>
      </View>

      <ViewOnlyList
        columns={columns}
        rows={rows}
        modalTitle="Device Details"
        onDelete={handleDelete}
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
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  filterContainer: {
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  filterLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    backgroundColor: '#f0f0f0',
  },
});
