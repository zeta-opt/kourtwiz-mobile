import { simplifyContacts } from '@/helpers/find-players/phoneContactsToList';
import { useRequestPlayerFinder } from '@/hooks/apis/player-finder/useRequestPlayerFinder';
import { RootState } from '@/store';
import {
  removePreferredContact,
  resetPlayerFinderData,
  setContactList,
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
  ProgressBar,
  Text,
} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import {
  closePlayerFinderModal,
  openSelectContactsModal,
} from '../../store/uiSlice';
import ChoosePlayersPool from './choose-players-pool/ChoosePlayersPool';

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
  const [skillLevel, setSkillLevel] = useState(1);
  const [playerCount, setPlayerCount] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const goToNext = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const goToPrevious = () => setStep((prev) => Math.max(prev - 1, 1));
  const { placeToPlay } = useSelector((state: RootState) => state.playerFinder);
  const { requestPlayerFinder, status: finderStatus } =
    useRequestPlayerFinder();
  console.log('Component mounted');
  const handleSubmit = async () => {
    requestPlayerFinder({
      finderData: {
        requestorId: userId,
        placeToPlay: placeToPlay,
        playTime: date.toISOString(),
        playersNeeded: playerCount,
        skillRating: skillLevel,
        preferredContacts: preferredContacts,
      },
      callbacks: {
        onSuccess: () => {
          dispatch(resetPlayerFinderData());
          refetch();
          setSubmitted(true);
        },
        onError: () => {
          dispatch(closePlayerFinderModal());
          Toast.show({
            type: 'error',
            text1: 'Failed to invite!',
          });
        },
      },
    });
  };
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <ChoosePlayersPool />;
      case 2:
        return (
          <View>
            <Button onPress={() => setDatePickerVisibility(true)}>
              Select Date and Time
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
              display='inline'
            />

            <Text variant='bodyMedium' style={{ marginTop: 8 }}>
              📅 Selected:{' '}
              {new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(date)}
            </Text>
          </View>
        );
      case 3:
        return (
          <View>
            <Text variant='titleMedium'>Skill Level</Text>
            <ProgressBar
              progress={skillLevel / 5}
              color={skillLevel > 3.8 ? 'red' : 'green'}
              style={styles.sliderBar}
            />
            <Button
              onPress={() => setSkillLevel(Math.min(skillLevel + 0.2, 5))}
            >
              Slide +
            </Button>
            <Button
              onPress={() => setSkillLevel(Math.max(skillLevel - 0.2, 1))}
            >
              Slide -
            </Button>
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
                        onPress={() => {
                          dispatch(removePreferredContact(index));
                        }}
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
                  const { data: contactsList } =
                    await Contacts.getContactsAsync({
                      fields: [Contacts.Fields.PhoneNumbers],
                    });
                  dispatch(setContactList(simplifyContacts(contactsList)));
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
                  setSkillLevel(1);
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
        contentContainerStyle={{
          ...styles.modalContent,
        }}
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
