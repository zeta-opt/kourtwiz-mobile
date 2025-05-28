import { useRequestPlayerFinder } from '@/hooks/apis/player-finder/useRequestPlayerFinder';
import { RootState } from '@/store';
import { resetPlayerFinderData } from '@/store/playerFinderSlice';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {
  Button,
  Card,
  Divider,
  Modal,
  Portal,
  ProgressBar,
  Text,
} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { closePlayerFinderModal } from '../../store/uiSlice';
import ChoosePlayersPool from './choose-players-pool/ChoosePlayersPool';

const totalSteps = 6;
type Props = {
  visible: boolean;
  refetch: () => void;
};
const MultiStepInviteModal = ({ visible, refetch }: Props) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId;
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(new Date());
  const [skillLevel, setSkillLevel] = useState(1);
  const [playerCount, setPlayerCount] = useState(1);
  const [contacts, setContacts] = useState([
    { contactName: 'Peter Jones', contactPhoneNumber: '+19876543210' },
  ]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  console.log(setContacts);
  const goToNext = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const goToPrevious = () => setStep((prev) => Math.max(prev - 1, 1));
  const { placeToPlay } = useSelector((state: RootState) => state.playerFinder);
  const { requestPlayerFinder, status: finderStatus } =
    useRequestPlayerFinder();

  const handleSubmit = async () => {
    requestPlayerFinder({
      finderData: {
        requestorId: userId,
        placeToPlay: placeToPlay,
        playTime: date.toISOString(),
        playersNeeded: playerCount,
        skillRating: skillLevel,
        preferredContacts: contacts,
      },
      callbacks: {
        onSuccess: () => {
          dispatch(resetPlayerFinderData());
          setDate(new Date());
          setSkillLevel(1);
          setPlayerCount(1);
          setStep(1);
          dispatch(closePlayerFinderModal());
          refetch();
          Toast.show({
            type: 'success',
            text1: 'Invitation sent!',
          });
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
              {contacts.map((contact, index) => (
                <Card key={index} style={styles.contactCard}>
                  <Card.Content>
                    <Text>{contact.contactName}</Text>
                    <Text>{contact.contactPhoneNumber}</Text>
                  </Card.Content>
                </Card>
              ))}
            </ScrollView>
            <Button
              mode='contained'
              style={{ marginVertical: 8 }}
              onPress={() => console.log('Add from contacts')}
            >
              Add from Contacts
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
              <Text>📊 Skill Level: {skillLevel.toFixed(1)}</Text>
            </Card.Content>
            <Button
              mode='contained'
              style={{ margin: 16 }}
              onPress={() => {
                handleSubmit();
              }}
              loading={finderStatus === 'loading'}
            >
              Find Players
            </Button>
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
    marginBottom: 8,
  },
  divider: {
    marginVertical: 6,
  },
});
