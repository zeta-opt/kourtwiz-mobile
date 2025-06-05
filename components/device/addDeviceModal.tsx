import { useAddClubDevice } from '@/hooks/apis/devices/useAddClubDevice';
import { useGetClubCourt } from '@/hooks/apis/courts/useGetClubCourts'; // ⬅️ Add this import
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  HelperText,
  Modal,
  Portal,
  Text,
  TextInput,
  Menu,
} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { z } from 'zod';
import { useState } from 'react';

const deviceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['CAMERA', 'LIGHT', 'SWITCH'], {
    required_error: 'Type is required',
  }),
  status: z.enum(['Online', 'Offline', 'Error'], {
    required_error: 'Status is required',
  }),
  courtId: z.string().min(1, 'Court is required'),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

type AddDeviceModalProps = {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: any) => void;
  currentClubId: string;
  refetch: () => void;
};

const AddDeviceModal = ({
  visible,
  onDismiss,
  onSubmit,
  currentClubId,
  refetch,
}: AddDeviceModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      status: 'Online',
      courtId: '',
    },
  });

  const { addDevice, status: addStatus } = useAddClubDevice();
  const { data: courts = [] } = useGetClubCourt({ clubId: currentClubId });

  const onFormSubmit = (data: DeviceFormData) => {
    addDevice({
      deviceData: { ...data, clubId: currentClubId },
      callbacks: {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: 'Device Added!' });
          reset();
          refetch();
          onSubmit(data);
        },
        onError: () => {
          Toast.show({ type: 'error', text1: 'Unable to add device!' });
        },
      },
    });
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Text variant='titleLarge' style={styles.title}>
          Add Device
        </Text>
        <ScrollView contentContainerStyle={styles.formContainer}>
          {/* Name */}
          <Controller
            control={control}
            name='name'
            render={({ field: { onChange, value } }) => (
              <TextInput
                label='Name'
                value={value}
                onChangeText={onChange}
                mode='outlined'
                error={!!errors.name}
                style={styles.input}
              />
            )}
          />
          {errors.name && (
            <HelperText type='error'>{errors.name.message}</HelperText>
          )}

          {/* Type */}
          <Controller
            control={control}
            name='type'
            render={({ field: { onChange, value } }) => {
              const [menuVisible, setMenuVisible] = useState(false);
              return (
                <View style={{ marginBottom: 10 }}>
                  <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                      <TextInput
                        label='Type'
                        value={value}
                        mode='outlined'
                        onFocus={() => setMenuVisible(true)}
                        error={!!errors.type}
                        style={styles.input}
                      />
                    }
                  >
                    {['CAMERA', 'LIGHT', 'SWITCH'].map((option) => (
                      <Menu.Item
                        key={option}
                        onPress={() => {
                          onChange(option);
                          setMenuVisible(false);
                        }}
                        title={option}
                      />
                    ))}
                  </Menu>
                  {errors.type && (
                    <HelperText type='error'>{errors.type.message}</HelperText>
                  )}
                </View>
              );
            }}
          />

          {/* Status */}
          <Controller
            control={control}
            name='status'
            render={({ field: { onChange, value } }) => {
              const [menuVisible, setMenuVisible] = useState(false);
              return (
                <View style={{ marginBottom: 10 }}>
                  <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                      <TextInput
                        label='Status'
                        value={value}
                        mode='outlined'
                        onFocus={() => setMenuVisible(true)}
                        error={!!errors.status}
                        style={styles.input}
                      />
                    }
                  >
                    {['Online', 'Offline', 'Error'].map((option) => (
                      <Menu.Item
                        key={option}
                        onPress={() => {
                          onChange(option);
                          setMenuVisible(false);
                        }}
                        title={option}
                      />
                    ))}
                  </Menu>
                  {errors.status && (
                    <HelperText type='error'>{errors.status.message}</HelperText>
                  )}
                </View>
              );
            }}
          />

          {/* Court Dropdown */}
          <Controller
            control={control}
            name='courtId'
            render={({ field: { onChange, value } }) => {
              const [menuVisible, setMenuVisible] = useState(false);
              return (
                <View style={{ marginBottom: 10 }}>
                  <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                      <TextInput
                        label='Court'
                        value={
                          (courts?.find((court) => court.id === value)?.name) ?? ''
                        }
                        mode='outlined'
                        onFocus={() => setMenuVisible(true)}
                        error={!!errors.courtId}
                        style={styles.input}
                      />
                    }
                  >
                    {courts?.map((court) => (
                      <Menu.Item
                        key={court.id}
                        onPress={() => {
                          onChange(court.id);
                          setMenuVisible(false);
                        }}
                        title={court.name}
                      />
                    ))}
                  </Menu>
                  {errors.courtId && (
                    <HelperText type='error'>
                      {errors.courtId.message}
                    </HelperText>
                  )}
                </View>
              );
            }}
          />
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button mode='outlined' onPress={onDismiss} style={styles.button}>
            Cancel
          </Button>
          <Button
            mode='contained'
            onPress={handleSubmit(onFormSubmit)}
            style={styles.button}
            loading={addStatus === 'loading'}
          >
            Submit
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

export default AddDeviceModal;

const styles = StyleSheet.create({
  modalContainer: {
    maxHeight: '90%',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  formContainer: {
    paddingBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingTop: 10,
  },
  button: {
    flex: 1,
  },
});
