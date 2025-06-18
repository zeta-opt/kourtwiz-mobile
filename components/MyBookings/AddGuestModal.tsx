import React from 'react';
import { View } from 'react-native';
import { Modal, Portal, Text, Button, TextInput, Card } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useAddGuest } from '@/hooks/apis/memberBookings/useAddGuest'; // your mobile hook

type Props = {
  visible: boolean;
  onDismiss: () => void;
  bookingId: string;
  whoseGuest: string;
  onSuccess: () => void;
};

type GuestFormData = {
  name: string;
  email: string;
  phoneNumber: string;
};

const AddGuestModal = ({ visible, onDismiss, bookingId, whoseGuest, onSuccess }: Props) => {
  const { control, handleSubmit, reset } = useForm<GuestFormData>();
  const { addGuest, isAddingGuest } = useAddGuest(() => {
    reset();
    onDismiss();
    onSuccess();
  });

  const onSubmit = (data: GuestFormData) => {
    addGuest({ ...data, bookingId, whoseGuest });
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={{ margin: 20, backgroundColor: 'white', padding: 20, borderRadius: 8 }}>
        <Card>
          <Card.Title title="Add Guest" />
          <Card.Content>
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <>
                  <TextInput label="Name" value={value} onChangeText={onChange} error={!!error} />
                  {error && <Text style={{ color: 'red' }}>{error.message}</Text>}
                </>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Email" value={value} onChangeText={onChange} keyboardType="email-address" />
              )}
            />

            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Phone Number" value={value} onChangeText={onChange} keyboardType="phone-pad" />
              )}
            />
          </Card.Content>
          <Card.Actions>
            <Button onPress={handleSubmit(onSubmit)} loading={isAddingGuest}>
              Submit
            </Button>
            <Button onPress={onDismiss}>Cancel</Button>
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  );
};

export default AddGuestModal;
