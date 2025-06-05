import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text as RNText,
  Alert,
} from 'react-native';
import {
  Button,
  Checkbox,
  Text,
  TextInput,
  IconButton,
  Portal,
  Modal,
  HelperText,
} from 'react-native-paper';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Dropdown } from 'react-native-paper-dropdown';
import {
  useCreateClubMembership,
  MembershipFormValues,
} from '@/hooks/apis/memberships/useCreateClubMembership';

type Props = {
  clubId: string;
  onClose: () => void;
  onSuccess: () => void;
  visible: boolean;
  currentClubId: string;
  refetch: () => void;
};

const perkOptions = [
  { id: 'advanceBookingDays', label: 'Advance Booking Days' },
  { id: 'openPlaySessionsAllowed', label: 'Open Play Sessions' },
  { id: 'tournamentAccess', label: 'Tournament Access' },
  { id: 'guestPasses', label: 'Guest Passes' },
  { id: 'coachingSessions', label: 'Coaching Sessions' },
];

type MembershipFormUI = Omit<MembershipFormValues, 'price'> & {
  price: string;
};

const initialForm: MembershipFormUI = {
  membershipName: '',
  price: '',
  duration: 'Duration',
  perks: {},
  customPerks: [],
};

export const MembershipForm = ({ clubId, onClose, onSuccess }: Props) => {
  const [modalVisible, setModalVisible] = useState(true);
  const { createMembership, status } = useCreateClubMembership();

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<MembershipFormUI>({
    defaultValues: initialForm,
  });

  const formatPrice = (value: string): string => {
    if (!value) return '';
    const sanitized = value.replace(/[^0-9.]/g, '').replace(/^0+/, '') || '0';
    const [intPart, decPart] = sanitized.split('.');
    const intFormatted = intPart ? parseInt(intPart, 10).toLocaleString('en-US') : '0';
    return decPart !== undefined ? `$${intFormatted}.${decPart.slice(0, 2)}` : `$${intFormatted}`;
  };

  const unformatPrice = (value: string): string => value.replace(/[^0-9.]/g, '');

  const watchedPerks = useWatch({ control, name: 'perks' });
  const watchedCustomPerks = useWatch({ control, name: 'customPerks' });

  const onSubmit = async () => {
    const values = getValues();
    const priceNumber = Number(parseFloat(unformatPrice(values.price)).toFixed(2));

    if (!values.membershipName.trim()) {
      Alert.alert('Error', 'Membership name is required');
      return;
    }
    if (isNaN(priceNumber) || priceNumber < 0) {
      Alert.alert('Error', 'Price must be a valid positive number');
      return;
    }
    if (!values.duration || values.duration === 'Duration') {
      Alert.alert('Error', 'Please select a duration');
      return;
    }

    await createMembership({
      clubId,
      formData: {
        ...values,
        price: priceNumber,
      },
      callbacks: {
        onSuccess,
        onError: err => Alert.alert('Error', err.message),
      },
    });
  };

  const onPressSubmit = () => {
    Alert.alert(
      'Confirm Submission',
      'Are you sure you want to submit this membership form?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: onSubmit },
      ]
    );
  };
  
  const handlePerkToggle = (id: string) => {
    const updatedPerks = { ...getValues().perks };
    if (updatedPerks[id]) {
      delete updatedPerks[id];
    } else {
      updatedPerks[id] = 1;
    }
    setValue('perks', updatedPerks);
  };

  const handlePerkValueChange = (id: string, value: string) => {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      const updatedPerks = { ...getValues().perks, [id]: parsed };
      setValue('perks', updatedPerks);
    }
  };

  const updateCustomPerk = (
    index: number,
    key: 'name' | 'value',
    value: string | number
  ) => {
    const updated = [...getValues().customPerks];
    updated[index][key] =
      key === 'value'
        ? (typeof value === 'string' ? (parseInt(value, 10) || 0).toString() : value.toString())
        : value as string;
    setValue('customPerks', updated);
  };

  const addCustomPerk = () => {
    const prev = getValues().customPerks;
    setValue('customPerks', [...prev, { name: '', value: '1' }]);
  };

  const removeCustomPerk = (index: number) => {
    const updated = [...getValues().customPerks];
    updated.splice(index, 1);
    setValue('customPerks', updated);
  };

  const handleDismiss = () => {
    setModalVisible(false);
    onClose();
  };

  const durationOptions = [
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Annual', value: 'Annual' },
  ];

  return (
    <Portal>
      <Modal
        visible = {modalVisible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Text variant="titleLarge" style={styles.title}>
          Add Membership Plan
        </Text>
        <ScrollView contentContainerStyle={styles.container}>
          <Controller
            name="membershipName"
            control={control}
            rules={{ required: 'Membership name is required' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Name"
                placeholder="e.g. Basic, Silver, Gold, Premium, Elite"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                error={!!errors.membershipName}
                style={styles.input}
              />
            )}
          />
          {errors.membershipName && (
            <HelperText type="error">{errors.membershipName.message}</HelperText>
          )}

          <Controller
            name="price"
            control={control}
            rules={{ required: 'Price must be a valid positive number' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Price"
                placeholder="$0.00"
                value={formatPrice(value)}
                onChangeText={val => onChange(unformatPrice(val))}
                keyboardType="decimal-pad"
                mode="outlined"
                error={!!errors.price}
                style={styles.input}
              />
            )}
          />
          {errors.price && (
            <HelperText type="error">{errors.price.message}</HelperText>
          )}

          <Controller
            name="duration"
            control={control}
            rules={{ required: 'Please select a valid duration' }}
            render={({ field: { value, onChange } }) => (
              <Dropdown
                label="Duration"
                mode="outlined"
                placeholder="Duration"
                value={value}
                onSelect={(val) => onChange(val || '')}
                options={durationOptions}
                error={!!errors.duration}
              />
            )}
          />
          {errors.duration && (
            <HelperText type="error">{errors.duration.message}</HelperText>
          )}
          
          <Text variant="labelLarge" style={styles.sectionHeader}>Standard Perks</Text>
          {perkOptions.map(perk => (
            <View key={perk.id} style={styles.checkboxRow}>
              <Checkbox
                status={watchedPerks?.[perk.id] ? 'checked' : 'unchecked'}
                onPress={() => handlePerkToggle(perk.id)}
              />
              <RNText>{perk.label}</RNText>
              {watchedPerks?.[perk.id] !== undefined && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <IconButton
                    icon="minus"
                    onPress={() =>
                      handlePerkValueChange(
                        perk.id,
                        ((parseInt(watchedPerks?.[perk.id]?.toString() || '0', 10) || 0) - 1).toString()
                      )}
                    disabled={parseInt(watchedPerks?.[perk.id]?.toString() || '0', 10) <= 0}
                  />
                  <Text style={{ width: 30, textAlign: 'center' }}>
                    {watchedPerks?.[perk.id]?.toString() ?? '0'}
                  </Text>
                  <IconButton
                    icon="plus"
                    onPress={() =>
                      handlePerkValueChange(
                        perk.id,
                        ((parseInt(watchedPerks?.[perk.id]?.toString() || '0', 10) || 0) + 1).toString()
                      )}
                  />
                </View>
              )}
            </View>
          ))}

          <Text variant="labelLarge" style={styles.sectionHeader}>Custom Perks</Text>
          {watchedCustomPerks?.map((perk, index) => (
            <View key={index} style={styles.customPerkRow}>
              <TextInput
                placeholder="Perk Name"
                value={perk.name}
                onChangeText={(text) => updateCustomPerk(index, 'name', text)}
                style={[styles.input, { flex: 1 }]}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <IconButton icon="minus" onPress={() =>
                  updateCustomPerk(index, 'value', (parseInt(perk.value, 10) || 0) - 1)
                } disabled={parseInt(perk.value, 10) <= 0} />
                <Text style={{ width: 30, textAlign: 'center' }}>{perk.value}</Text>
                <IconButton icon="plus" onPress={() =>
                  updateCustomPerk(index, 'value', (parseInt(perk.value, 10) || 0) + 1)
                } />
              </View>
              <IconButton icon="delete" onPress={() => removeCustomPerk(index)} />
            </View>
          ))}
          <Button onPress={addCustomPerk} icon="plus">Add Custom Perk</Button>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={handleDismiss} style={styles.button}>Cancel</Button>
          <Button mode="contained" onPress={handleSubmit(onPressSubmit)} style={styles.button} loading={status === 'loading'}>
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
  container: {
    padding: 0,
  },
  input: {
    marginBottom: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 8,
  },
  customPerkRow: {
    flexDirection: 'row',
    alignItems: 'center',
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

export default MembershipForm;