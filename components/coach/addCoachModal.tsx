import { useAddClubCoach } from '@/hooks/apis/coach/useAddClubCoach';
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
} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { z } from 'zod';

type AddCoachModalProps = {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: any) => void;
  currentClubId: string;
  refetch: () => void;
};

const coachSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email({ message: 'Invalid email address' }),
  pricePerHour: z.string().min(1, 'Name is required'),
});

type CoachFormData = z.infer<typeof coachSchema>;

const AddCoachModal = ({
  visible,
  onDismiss,
  onSubmit,
  currentClubId,
  refetch,
}: AddCoachModalProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CoachFormData>({
    resolver: zodResolver(coachSchema),
  });

  const { addCoach, status } = useAddClubCoach();

  const onFormSubmit = (data: any) => {
    console.log(data);
    addCoach({
      coachData: { ...data, clubId: currentClubId },
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
          Add Coach
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

          {/* Email Input */}
          <Controller
            control={control}
            name='email'
            render={({ field: { onChange, value } }) => (
              <TextInput
                label='Email'
                value={value}
                onChangeText={onChange}
                mode='outlined'
                error={!!errors.email}
                style={styles.input}
              />
            )}
          />
          {errors.email && (
            <HelperText type='error'>{errors.email.message}</HelperText>
          )}

          {/* Email Input */}
          <Controller
            control={control}
            name='pricePerHour'
            render={({ field: { onChange, value } }) => (
              <TextInput
                label='Price Per Hour'
                value={value}
                onChangeText={onChange}
                mode='outlined'
                error={!!errors.pricePerHour}
                style={styles.input}
              />
            )}
          />
          {errors.pricePerHour && (
            <HelperText type='error'>{errors.pricePerHour.message}</HelperText>
          )}
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

export default AddCoachModal;

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
