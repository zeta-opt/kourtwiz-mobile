import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Text as RNText,
  Alert,
} from 'react-native';
import {
    Button,
    Checkbox,
    Text,
    IconButton,
    Portal,
    Modal,
} from 'react-native-paper';
import { Controller, useForm} from 'react-hook-form';
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
  
const initialForm: MembershipFormValues = {
  membershipName: '',
  price: 0,
  duration: 'Monthly',
  perks: {},
  customPerks: [],
};

export const MembershipForm = ({ clubId, onClose, onSuccess }: Props) => {
  const [formData, setFormData] = useState(initialForm);
  const [modalVisible, setModalVisible] = useState(true);
  const { createMembership, status } = useCreateClubMembership();
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');


  const handleChange = (field: keyof MembershipFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePerkToggle = (id: string) => {
    const updatedPerks = { ...formData.perks };
    if (Object.prototype.hasOwnProperty.call(updatedPerks, id)) {
      delete updatedPerks[id];
    } else {
      updatedPerks[id] = 1;
    }
    handleChange('perks', updatedPerks);
  };
  
  const handlePerkValueChange = (id: string, value: string) => {
    if (value === '') {
      handleChange('perks', { ...formData.perks, [id]: '' });
      return;
    }
  
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      handleChange('perks', { ...formData.perks, [id]: parsed });
    }
  };
  ;

  const addCustomPerk = () => {
    setFormData(prev => ({
      ...prev,
      customPerks: [...prev.customPerks, { name: '', value: '1' }],
    }));
  };

  const updateCustomPerk = (
    index: number,
    key: 'name' | 'value',
    value: string | number
  ) => {
    const updated = [...formData.customPerks];
    if (key === 'value') {
      updated[index].value = typeof value === 'string' ? (parseInt(value, 10) || 0).toString() : value.toString();
    } else {
      updated[index].name = value as string;
    }
    handleChange('customPerks', updated);
  };

  const removeCustomPerk = (index: number) => {
    const updated = [...formData.customPerks];
    updated.splice(index, 1);
    handleChange('customPerks', updated);
  };

  const incrementPrice = () => {
    const value = Number(formData.price) || 0;
    handleChange('price', (value + 1).toFixed(2));
  };

  const decrementPrice = () => {
    const value = Number(formData.price) || 0;
    if (value > 0) handleChange('price', (value - 1).toFixed(2));
  };

  const durationOptions = [
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Annual', value: 'Annual' },
  ];

  const handleSubmit = async () => {
    const formattedPrice = Number(formData.price).toFixed(2);
    setNameError('');
    setPriceError('');

    if (!formData.membershipName.trim()) {
      setNameError('Membership name is required');
      return; // Prevent submission
    }
    if (formData.price < 0) {
      setPriceError('Price cannot be negative');
      return; // Prevent submission
    }
    
    await createMembership({
      clubId,
      formData: {
        ...formData,
        price: Number(formattedPrice),
      },
      callbacks: {
        onSuccess,
        onError: err => Alert.alert('Error', err.message),
      },
    });
  };
  
  const {
    control
  } = useForm<MembershipFormValues>({
    defaultValues: initialForm, 
  });  
  
  const handleDismiss = () => {
    setModalVisible(false);
    onClose();
  };
  
  
  return (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Text variant='titleLarge' style={styles.title}>Add Membership Plan</Text>
        <ScrollView contentContainerStyle={styles.container}>
        <Text variant='labelLarge'>Name</Text>
          <TextInput
            placeholder='e.g. Basic, Silver, Gold, Premium, Elite'
            value={formData.membershipName}
            onChangeText={text => handleChange('membershipName', text)}
            style={styles.input}
          />
          {nameError ? <Text style={{ color: 'red', marginBottom: 8 }}>{nameError}</Text> : null}

          <Text variant='labelLarge'>Price</Text>
          <View style={styles.row}>
          <TextInput
            aria-label="Price"
            value={formData.price.toString()}
            onChangeText={(val) => handleChange('price', val)}
            keyboardType="decimal-pad"
            style={styles.input}
            />
            <View style={styles.priceButtons}>
              <IconButton icon='plus' onPress={incrementPrice} />
              <IconButton icon='minus' onPress={decrementPrice} disabled={Number(formData.price) <= 0} />
            </View>
          </View>
          {priceError ? (
              <Text style={{ color: 'red', marginBottom: 8}}>
                {priceError}
              </Text>
            ) : null}

          <Text variant='labelLarge'>Duration</Text>
          <Controller
            name="duration"
            control={control}
            render={() => (
                <>
                <Dropdown
                    label="Duration"
                    mode="outlined"
                    placeholder="Select duration"
                    value={formData.duration}
                    onSelect={(val) => {
                    handleChange('duration', val || ''); 
                    }}
                    options={durationOptions}
                />
                </>
            )}
            />

          <Text variant='labelLarge' style={styles.sectionHeader}>Standard Perks</Text>
          {perkOptions.map(perk => (
            <View key={perk.id} style={styles.checkboxRow}>
              <Checkbox
                status={formData.perks[perk.id] !== undefined ? 'checked' : 'unchecked'}
                onPress={() => handlePerkToggle(perk.id)}
              />
              <RNText>{perk.label}</RNText>
              {formData.perks[perk.id] !== undefined && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <IconButton icon='minus' onPress={() => handlePerkValueChange(perk.id, ((parseInt(formData.perks[perk.id]?.toString() ?? '0', 10) || 0) - 1).toString())} disabled={parseInt(formData.perks[perk.id]?.toString() ?? '0', 10) <= 0}/>
                  <Text style={{ width: 30, textAlign: 'center' }}>{formData.perks[perk.id]?.toString() ?? '0'}</Text>
                  <IconButton icon='plus' onPress={() => handlePerkValueChange(perk.id, ((parseInt(formData.perks[perk.id]?.toString() ?? '0', 10) || 0) + 1).toString())} />
                </View>
              )}
            </View>
          ))}

          <Text variant='labelLarge' style={styles.sectionHeader}>Custom Perks</Text>
            {formData.customPerks.map((perk, index) => (
            <View key={index} style={styles.customPerkRow}>
              <TextInput
                placeholder='Perk Name'
                value={perk.name}
                onChangeText={text => updateCustomPerk(index, 'name', text)}
                style={[styles.input, { flex: 1 }]}
                autoCapitalize="words"
              />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <IconButton icon='minus' onPress={() => updateCustomPerk(index, 'value', (parseInt(perk.value, 10) || 0) - 1)} disabled={parseInt(perk.value, 10) <= 0}/>
                <Text style={{ width: 30, textAlign: 'center' }}>{perk.value.toString()}</Text>
                <IconButton icon='plus' onPress={() => updateCustomPerk(index, 'value', (parseInt(perk.value, 10) || 0) + 1)} />
              </View>
              <IconButton icon='delete' onPress={() => removeCustomPerk(index)} />
            </View>
          ))}

          <Button onPress={addCustomPerk} icon='plus'>Add Custom Perk</Button>

          <View style={styles.buttonContainer}>
            <Button mode='outlined' onPress={handleDismiss} style={styles.button}>Cancel</Button>
            <Button
              mode='contained'
              onPress={handleSubmit}
              style={styles.button}
              loading={status === 'loading'}
            >
              Submit
            </Button>
          </View>
        </ScrollView>
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
    borderBottomWidth: 1,
    marginBottom: 12,
    padding: 8,
  },
  
  inputFlex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceButtons: {
    flexDirection: 'row',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  perkInput: {
    marginLeft: 10,
    borderBottomWidth: 1,
    padding: 4,
    width: 80,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 8,
  },
  customPerkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
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