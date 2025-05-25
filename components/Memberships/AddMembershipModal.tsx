import { useGetMembershipsByClubId } from '@/hooks/apis/memberships/useGetmembershipsByClubId';
import { useMutateAddUser } from '@/hooks/apis/user/useMutateAddUser';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useRef, useState } from 'react';
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
import PhoneInput from 'react-native-phone-number-input';
import Toast from 'react-native-toast-message';
import { z } from 'zod';

const skillOptions = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
];

const preferredTimeOptions = [
  { label: 'Morning', value: 'Morning' },
  { label: 'Afternoon', value: 'Afternoon' },
  { label: 'Evening', value: 'Evening' },
  { label: 'Night', value: 'Night' },
];

const genderOptions = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
];

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  password: z.string(),
  email: z.string().email('Invalid email'),
  phoneNumber: z
    .string()
    .min(8, 'Phone number is too short')
    .max(15, 'Phone number is too long'),
  dateOfBirth: z.date(),
  skillLevel: z
    .number({ required_error: 'Skill level is required' })
    .min(1)
    .max(5),
  preferredTime: z.string().min(1),
  gender: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  zipCode: z.string().min(1),
  membershipTypeId: z.string().min(1),
  currentActiveClubId: z.string().min(1),
});

type UserFormData = z.infer<typeof userSchema>;

type AddMembershipModalProps = {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: any) => void;
  currentClubId: string;
  refetch: () => void;
};

const AddMembershipModal: React.FC<AddMembershipModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  currentClubId,
  refetch,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const [skillValue, setSkillValue] = useState('');
  const [preferredTimeValue, setPreferredTimeValue] = useState('');
  const [genderValue, setGendervalue] = useState('');
  const [membershipValue, setMembershipValue] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      dateOfBirth: new Date(),
      password: '',
      currentActiveClubId: currentClubId,
    },
  });

  const phoneInputRef = useRef<PhoneInput>(null);
  const PhoneInputComponent = PhoneInput as unknown as React.ComponentType<any>;

  const { data: clubMembershipData = [] } = useGetMembershipsByClubId(
    currentClubId ?? ''
  );
  const { addUser, status: submitStatus } = useMutateAddUser();
  const onFormSubmit = (data: UserFormData) => {
    const isValid = phoneInputRef.current?.isValidNumber(data.phoneNumber);
    if (!isValid) {
      return;
    }

    const formattedData = {
      ...data,
      dateOfBirth: data.dateOfBirth.toISOString().split('T')[0], // "YYYY-MM-DD"
    };
    addUser({
      payload: formattedData,
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
    onSubmit(formattedData);
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (event.type === 'set' && selectedDate) {
      // Delay setting the value slightly to avoid reopening the picker
      setShowPicker(false);
      setTimeout(() => {
        setValue('dateOfBirth', selectedDate, { shouldValidate: true });
      }, 0);
    } else {
      setShowPicker(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        {/* Header (Sticky) */}
        <Text variant='titleLarge' style={styles.title}>
          Create User
        </Text>

        {/* Scrollable Form */}
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
                keyboardType='email-address'
                autoCapitalize='none'
                error={!!errors.email}
                style={styles.input}
              />
            )}
          />
          {errors.email && (
            <HelperText type='error'>{errors.email.message}</HelperText>
          )}

          {/* Phone Input */}
          <Controller
            control={control}
            name='phoneNumber'
            render={({ field: { onChange, value } }) => (
              <PhoneInputComponent
                ref={phoneInputRef}
                defaultValue={value}
                defaultCode='IN'
                layout='first'
                onChangeFormattedText={onChange}
                containerStyle={styles.phoneContainer}
                textContainerStyle={styles.phoneTextContainer}
                textInputProps={{
                  keyboardType: 'phone-pad',
                }}
              />
            )}
          />
          {errors.phoneNumber && (
            <HelperText type='error'>{errors.phoneNumber.message}</HelperText>
          )}

          {/* Date of Birth Input (opens Date Picker) */}
          <Controller
            control={control}
            name='dateOfBirth'
            render={({ field: { value, onChange } }) => (
              <>
                <TextInput
                  label='Date of Birth'
                  value={value ? value.toISOString().split('T')[0] : ''}
                  onPressIn={() => setShowPicker(true)}
                  mode='outlined'
                  style={styles.input}
                  editable={false}
                  right={
                    <TextInput.Icon
                      icon='calendar'
                      onPress={() => setShowPicker(true)}
                    />
                  }
                />
                {errors.dateOfBirth && (
                  <HelperText type='error' visible={!!errors.dateOfBirth}>
                    {errors.dateOfBirth.message}
                  </HelperText>
                )}
                {showPicker && (
                  <DateTimePicker
                    value={value || new Date()}
                    mode='date'
                    display='default'
                    maximumDate={new Date()}
                    onChange={handleDateChange}
                  />
                )}
              </>
            )}
          />

          {/* skill level dropdown */}
          <Controller
            name='skillLevel'
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <Dropdown
                  label='Skill Level'
                  mode='outlined'
                  placeholder='Select Skill level'
                  value={skillValue}
                  onSelect={(skill) => {
                    setSkillValue(skill || '');
                    setValue('skillLevel', Number(skill));
                  }}
                  options={skillOptions}
                />
                {errors.skillLevel && (
                  <HelperText type='error'>
                    {errors.skillLevel.message}
                  </HelperText>
                )}
              </>
            )}
          />

          {/* skill level dropdown */}
          <Controller
            name='preferredTime'
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <Dropdown
                  label='Preferred Time'
                  mode='outlined'
                  placeholder='Select Skill level'
                  value={preferredTimeValue}
                  onSelect={(val) => {
                    setPreferredTimeValue(val || '');
                    setValue('preferredTime', val || '');
                  }}
                  options={preferredTimeOptions}
                />
                {errors.preferredTime && (
                  <HelperText type='error'>
                    {errors.preferredTime.message}
                  </HelperText>
                )}
              </>
            )}
          />

          {/* gender dropdown */}
          <Controller
            name='gender'
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <Dropdown
                  label='Gender'
                  mode='outlined'
                  placeholder='select Gender'
                  value={genderValue}
                  onSelect={(gender) => {
                    setGendervalue(gender || '');
                    setValue('gender', gender || '');
                  }}
                  options={genderOptions}
                />
                {errors.gender && (
                  <HelperText type='error'>{errors.gender.message}</HelperText>
                )}
              </>
            )}
          />

          {/* Address Input */}
          <Controller
            control={control}
            name='address'
            render={({ field: { onChange, value } }) => (
              <TextInput
                label='Address'
                value={value}
                onChangeText={onChange}
                mode='outlined'
                error={!!errors.name}
                style={styles.input}
              />
            )}
          />
          {errors.address && (
            <HelperText type='error'>{errors.address.message}</HelperText>
          )}

          {/* city Input */}
          <Controller
            control={control}
            name='city'
            render={({ field: { onChange, value } }) => (
              <TextInput
                label='City'
                value={value}
                onChangeText={onChange}
                mode='outlined'
                error={!!errors.name}
                style={styles.input}
              />
            )}
          />
          {errors.city && (
            <HelperText type='error'>{errors.city.message}</HelperText>
          )}

          {/* state Input */}
          <Controller
            control={control}
            name='state'
            render={({ field: { onChange, value } }) => (
              <TextInput
                label='State'
                value={value}
                onChangeText={onChange}
                mode='outlined'
                error={!!errors.name}
                style={styles.input}
              />
            )}
          />
          {errors.state && (
            <HelperText type='error'>{errors.state.message}</HelperText>
          )}

          {/* country Input */}
          <Controller
            control={control}
            name='country'
            render={({ field: { onChange, value } }) => (
              <TextInput
                label='Country'
                value={value}
                onChangeText={onChange}
                mode='outlined'
                error={!!errors.name}
                style={styles.input}
              />
            )}
          />
          {errors.country && (
            <HelperText type='error'>{errors.country.message}</HelperText>
          )}

          {/* zipcode Input */}
          <Controller
            control={control}
            name='zipCode'
            render={({ field: { onChange, value } }) => (
              <TextInput
                label='Zip Code'
                value={value}
                onChangeText={onChange}
                mode='outlined'
                error={!!errors.name}
                style={styles.input}
              />
            )}
          />
          {errors.zipCode && (
            <HelperText type='error'>{errors.zipCode.message}</HelperText>
          )}

          {/* membership dropdown */}
          <Controller
            name='membershipTypeId'
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <Dropdown
                  label='Membership '
                  mode='outlined'
                  placeholder='select Membership'
                  value={membershipValue}
                  onSelect={(val) => {
                    setMembershipValue(val || '');
                    setValue('membershipTypeId', val || '');
                  }}
                  options={
                    clubMembershipData?.map((membership: any) => ({
                      label: membership.membershipName,
                      value: membership.id,
                    })) || []
                  }
                />
                {errors.membershipTypeId && (
                  <HelperText type='error'>
                    {errors.membershipTypeId.message}
                  </HelperText>
                )}
              </>
            )}
          />
        </ScrollView>

        {/* Buttons (Sticky) */}
        <View style={styles.buttonContainer}>
          <Button mode='outlined' onPress={onDismiss} style={styles.button}>
            Cancel
          </Button>
          <Button
            mode='contained'
            onPress={handleSubmit(onFormSubmit)}
            style={styles.button}
            // disabled={!isValid}
            loading={submitStatus === 'loading'}
          >
            Submit
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

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
  phoneContainer: {
    width: '100%',
    height: 50,
    marginBottom: 10,
  },
  phoneTextContainer: {
    paddingVertical: 0,
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

export default AddMembershipModal;
