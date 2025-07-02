import { RootState } from '@/store';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import {
  closePlayerFinderModal,
  openPreferredPlaceModal,
  openSearchPlaceModal,
} from '../../../store/uiSlice';

const ChoosePlayersPool = () => {
  const dispatch = useDispatch();
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const { placeToPlay } = useSelector((state: RootState) => state.playerFinder);

  const handleCardSelection = (cardIndex: number, modalAction: () => void) => {
    setSelectedCard(cardIndex);
    dispatch(closePlayerFinderModal());
    modalAction();
  };

  return (
    <View>
      {/* Preferred Places */}
      <Card
        onPress={() => handleCardSelection(0, () => dispatch(openPreferredPlaceModal()))}
        style={[styles.optionCard, selectedCard === 0 && styles.selectedCard]}
      >
        <Card.Content>
          <Text>Choose from Preferred Places</Text>
        </Card.Content>
      </Card>

      {/* Search Places */}
      <Card
        onPress={() => handleCardSelection(1, () => dispatch(openSearchPlaceModal()))}
        style={[styles.optionCard, selectedCard === 1 && styles.selectedCard]}
      >
        <Card.Content>
          <Text>Search Places</Text>
        </Card.Content>
      </Card>
      <Card
        onPress={() => setSelectedCard(2)}
        style={[styles.optionCard, selectedCard === 2 && styles.selectedCard]}
      >
        <Card.Content>
          <Text>Choose on Map</Text>
        </Card.Content>
      </Card>
      {placeToPlay && (
        <Card style={[styles.optionCard, styles.selectedCard]}>
          <Card.Content>
            <Text>📍 {placeToPlay}</Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );
};

export default ChoosePlayersPool;

const styles = StyleSheet.create({
  optionCard: {
    marginBottom: 8,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: 'blue',
  },
});