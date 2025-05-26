import { useAddCourt } from '@/hooks/apis/courts/useAddCourt';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  HelperText,
  Modal,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';
import Toast from 'react-native-toast-message';
import { z } from 'zod';

type AddCourtModalProps = {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: any) => void;
  currentClubId: string;
  refetch: () => void;
};

const courtSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  surface: z.string().min(1, 'Surface is required'),
  reservationIntervalMinutes: z.number({
    required_error: 'Skill level is required',
  }),
});

type CourtFormData = z.infer<typeof courtSchema>;

const intervalOptions = [
  { label: '30 minutes', value: '30' },
  { label: '60 minutes', value: '60' },
  { label: '120 minutes', value: '120' },
];

const AddCourtsModal = ({
  visible,
  onDismiss,
  onSubmit,
  currentClubId,
  refetch,
}: AddCourtModalProps) => {
  const [intervalValue, setIntervalValue] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CourtFormData>({
    resolver: zodResolver(courtSchema),
  });
  const { addUser, status } = useAddCourt();
  const onFormSubmit = (data: any) => {
    console.log(data);
    addUser({
      courtData: data,
      clubId: currentClubId,
      callbacks: {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: 'User Added!',
          });
          refetch();
        },
        onError: () => {
          Toast.show({
            type: 'error',
            text1: 'unable to add!',
          });
        },
      },
    });
    onSubmit(data);
  };
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Text variant='titleLarge' style={styles.title}>
          Add Court
        </Text>
        <ScrollView contentContainerStyle={styles.formContainer}>
          {/* Name Input */}
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

          {/* Surface Input */}
          <Controller
            control={control}
            name='surface'
            render={({ field: { onChange, value } }) => (
              <TextInput
                label='Surface'
                value={value}
                onChangeText={onChange}
                mode='outlined'
                error={!!errors.surface}
                style={styles.input}
              />
            )}
          />
          {errors.surface && (
            <HelperText type='error'>{errors.surface.message}</HelperText>
          )}

          {/* skill level dropdown */}
          <Controller
            name='reservationIntervalMinutes'
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <Dropdown
                  label='Interval'
                  mode='outlined'
                  placeholder='Select Skill level'
                  value={intervalValue}
                  onSelect={(val) => {
                    setIntervalValue(val || '');
                    setValue('reservationIntervalMinutes', Number(val));
                  }}
                  options={intervalOptions}
                />
                {errors.reservationIntervalMinutes && (
                  <HelperText type='error'>
                    {errors.reservationIntervalMinutes.message}
                  </HelperText>
                )}
              </>
            )}
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
            // disabled={!isValid}
            loading={status === 'loading'}
          >
            Submit
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

export default AddCourtsModal;

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
