import { simplifyContacts } from '@/helpers/find-players/phoneContactsToList';
import { useRequestPlayerFinder } from '@/hooks/apis/player-finder/useRequestPlayerFinder';
import { RootState } from '@/store';
import {
  removePreferredContact,
  resetPlayerFinderData,
  setContactList,
  setPlayersNeeded,
} from '@/store/playerFinderSlice';
import * as Contacts from 'expo-contacts';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {
  Button,
  Card,
  Divider,
  IconButton,
  Modal,
  Portal,
  Text,
  Dialog,
  Portal as PaperPortal,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import {
  closePlayerFinderModal,
  openSelectContactsModal,
} from '../../store/uiSlice';
import ChoosePlayersPool from './choose-players-pool/ChoosePlayersPool';
import Slider from '@react-native-community/slider';

const totalSteps = 6;

type Props = {
  visible: boolean;
  refetch: () => void;
};

const MultiStepInviteModal = ({ visible, refetch }: Props) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { preferredContacts } = useSelector(
    (state: RootState) => state.playerFinder
  );

  const userId = user?.userId;
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(new Date());
  const [playEndTime, setPlayEndTime] = useState<Date | null>(null);
  const [isEndPickerVisible, setEndPickerVisibility] = useState(false);
  const getDefaultSkillLevel = () => user?.playerDetails?.personalRating ?? 1;
  const [skillLevel, setSkillLevel] = useState<number>(getDefaultSkillLevel());
  const [playerCount, setPlayerCount] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [conflictDialogVisible, setConflictDialogVisible] = useState(false);

  const goToNext = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const goToPrevious = () => setStep((prev) => Math.max(prev - 1, 1));
  const { placeToPlay } = useSelector((state: RootState) => state.playerFinder);
  const { requestPlayerFinder, status: finderStatus } =
    useRequestPlayerFinder();
  console.log('Component mounted');
  const handleSubmit = async () => {
    const finalEndTime = playEndTime || new Date(date.getTime() + 60 * 60 * 1000);
    requestPlayerFinder({
      finderData: {
        requestorId: userId,
        placeToPlay,
        playTime: date.toISOString(),
        playEndTime: finalEndTime.toISOString(),
        playersNeeded: playerCount,
        skillRating: skillLevel,
        preferredContacts,
      },
      callbacks: {
        onSuccess: () => {
          dispatch(resetPlayerFinderData());
          refetch();
          setSubmitted(true);
        },
        onError: () => {
          setConflictDialogVisible(true);
        },
      },
    });
  };

  const getSliderColor = (value: number): string => {
    if (value <= 2) return '#f4d03f';
    if (value <= 3) return '#90ee90';
    if (value <= 4) return '#f39c12';
    return '#e74c3c';
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <ChoosePlayersPool />;
      case 2:
        return (
          <View>
            <Button onPress={() => setDatePickerVisibility(true)}>
              Select Start Date and Time
            </Button>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode='datetime'
              date={date}
              onConfirm={(selectedDate) => {
                setDate(selectedDate);
                setDatePickerVisibility(false);
              }}
              onCancel={() => setDatePickerVisibility(false)}
              display='spinner'
            />
            <Text variant='bodyMedium' style={{ marginTop: 8 }}>
              📅 Start Time:{' '}
              {new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(date)}
            </Text>
            <Button onPress={() => setEndPickerVisibility(true)} style={{ marginTop: 16 }}>
              Select End Time
            </Button>
            <DateTimePickerModal
              isVisible={isEndPickerVisible}
              mode='time'
              date={playEndTime || date}
              onConfirm={(selectedTime) => {
                const newEndTime = new Date(date);
                newEndTime.setHours(selectedTime.getHours());
                newEndTime.setMinutes(selectedTime.getMinutes());
                newEndTime.setSeconds(0);
                setPlayEndTime(newEndTime);
                setEndPickerVisibility(false);
              }}
              onCancel={() => setEndPickerVisibility(false)}
              display='spinner'
            />
            {playEndTime && (
              <Text variant='bodyMedium' style={{ marginTop: 8 }}>
                ⏱️ End Time:{' '}
                {new Intl.DateTimeFormat('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(playEndTime)}
              </Text>
            )}
          </View>
        );
      case 3:
        const sliderColor = getSliderColor(skillLevel);
        return (
          <View style={styles.container}>
            <Text variant='titleMedium'>Skill Level</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={5}
              step={0.1}
              value={skillLevel ?? 1}
              minimumTrackTintColor={sliderColor}
              maximumTrackTintColor="#ccc"
              thumbTintColor={sliderColor}
              onValueChange={(value) => setSkillLevel(value)}
            />
            <Text>Selected: {skillLevel.toFixed(1)}</Text>
          </View>
        );
      case 4:
        return (
          <View>
            <Text variant='titleMedium'>
              How many players are you looking for?
            </Text>
            <View style={styles.countSelector}>
              {[1, 2, 3, 4].map((num) => (
                <Button
                  key={num}
                  mode={playerCount === num ? 'contained' : 'outlined'}
                  onPress={() => setPlayerCount(num)}
                  style={styles.countButton}
                >
                  {num}
                </Button>
              ))}
            </View>
          </View>
        );
      case 5:
        return (
          <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }}>
              {preferredContacts.length === 0 && (
                <Text>No contact selected</Text>
              )}
              {preferredContacts.map((contact, index) => (
                <Card key={index} style={styles.contactCard}>
                  <Card.Title
                    title={contact.contactName}
                    subtitle={contact.contactPhoneNumber}
                    right={() => (
                      <IconButton
                        icon='close'
                        onPress={() => dispatch(removePreferredContact(index))}
                      />
                    )}
                  />
                </Card>
              ))}
            </ScrollView>
            <Button
              mode='contained'
              style={{ marginVertical: 8 }}
              onPress={async () => {
                const { status } = await Contacts.requestPermissionsAsync();
                if (status === 'granted') {
                  const { data: contactsList } = await Contacts.getContactsAsync({
                    fields: [Contacts.Fields.PhoneNumbers],
                  });
                  console.log(
                    'contact list data : ',
                    JSON.stringify(simplifyContacts(contactsList))
                  );
                  dispatch(setContactList(simplifyContacts(contactsList)));
                  dispatch(setPlayersNeeded(playerCount));
                  dispatch(openSelectContactsModal());
                  dispatch(closePlayerFinderModal());
                }
              }}
            >
              Invite From Contacts
            </Button>
          </View>
        );
      case 6:
        return (
          <Card>
            <Card.Content>
              <Text variant='titleMedium'>Summary</Text>
              <Divider style={styles.divider} />
              <Text>📍 Location: {placeToPlay}</Text>
              <Divider style={styles.divider} />
              <Text>📅 Date & Time: {date.toLocaleString()}</Text>
              <Divider style={styles.divider} />
              <Text>👥 Players: {playerCount}</Text>
              <Divider style={styles.divider} />
              <Text>👥 Contact: {preferredContacts.length}</Text>
              <Divider style={styles.divider} />
              <Text>📊 Skill Level: {skillLevel.toFixed(1)}</Text>
            </Card.Content>
            {submitted ? (
              <Button
                mode='contained'
                style={{ margin: 16, backgroundColor: 'green' }}
                icon='check'
                labelStyle={{ color: 'white' }}
                onPress={() => {
                  setDate(new Date());
                  setSkillLevel(getDefaultSkillLevel());
                  setPlayerCount(1);
                  setStep(1);
                  setSubmitted(false);
                  dispatch(closePlayerFinderModal());
                }}
              >
                <Text style={{ color: 'white' }}>Submitted</Text>
              </Button>
            ) : (
              <Button
                mode='contained'
                style={{ margin: 16 }}
                onPress={handleSubmit}
                loading={finderStatus === 'loading'}
              >
                Find Players
              </Button>
            )}
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={() => dispatch(closePlayerFinderModal())}
        contentContainerStyle={styles.modalContent}
      >
        <View style={styles.progressContainer}>
          {[...Array(totalSteps)].map((_, i) => (
            <View
              key={i}
              style={[styles.circle, step === i + 1 && styles.activeCircle]}
            />
          ))}
        </View>

        <View style={styles.stepContainer}>{renderStepContent()}</View>

        <View style={styles.navigationButtons}>
          {step > 1 && <Button onPress={goToPrevious}>Previous</Button>}
          {step < totalSteps && <Button onPress={goToNext}>Next</Button>}
        </View>
      </Modal>

      {/* Booking conflict dialog */}
      <PaperPortal>
        <Dialog
          visible={conflictDialogVisible}
          onDismiss={() => setConflictDialogVisible(false)}
        >
          <Dialog.Title>Booking Conflict</Dialog.Title>
          <Dialog.Content>
            <Text variant='bodyMedium'>
              You already have a booking at this time. Please choose another slot.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConflictDialogVisible(false)}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </PaperPortal>
    </Portal>
  );
};

export default MultiStepInviteModal;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    zIndex: 100,
  },
  container: {
    padding: 16,
  },
  slider: {
    width: '100%',
    height: 100,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 6,
  },
  activeCircle: {
    width: 14,
    height: 14,
    backgroundColor: 'blue',
  },
  stepContainer: {
    minHeight: 400,
    marginBottom: 16,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionCard: {
    marginBottom: 8,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: 'blue',
  },
  sliderBar: {
    height: 10,
    borderRadius: 5,
    marginVertical: 12,
  },
  countSelector: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-around',
  },
  countButton: {
    marginHorizontal: 4,
  },
  contactCard: {
    marginVertical: 6,
    marginHorizontal: 12,
    elevation: 2,
  },
  divider: {
    marginVertical: 6,
  },
});
