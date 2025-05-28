import { RootState } from '@/store';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import {
  closePlayerFinderModal,
  openPreferredPlaceModal,
} from '../../../store/uiSlice';

const ChoosePlayersPool = () => {
  const dispatch = useDispatch();
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const { placeToPlay } = useSelector((state: RootState) => state.playerFinder);
  const handleOpenPreferredPlaces = () => {
    console.log('clicked !');
    setSelectedCard(0);
    dispatch(closePlayerFinderModal());
    dispatch(openPreferredPlaceModal());
  };
  return (
    <View>
      <Card
        key={0}
        onPress={() => {
          handleOpenPreferredPlaces();
        }}
        style={[styles.optionCard, selectedCard === 0 && styles.selectedCard]}
      >
        <Card.Content>
          <Text>Choose from preferred players</Text>
        </Card.Content>
      </Card>
      <Card
        key={1}
        onPress={() => setSelectedCard(1)}
        style={[styles.optionCard, selectedCard === 1 && styles.selectedCard]}
      >
        <Card.Content>
          <Text>Search Places</Text>
        </Card.Content>
      </Card>
      <Card
        key={2}
        onPress={() => setSelectedCard(2)}
        style={[styles.optionCard, selectedCard === 2 && styles.selectedCard]}
      >
        <Card.Content>
          <Text>Choose on map</Text>
        </Card.Content>
      </Card>
      {placeToPlay && (
        <Card key={3} style={[styles.optionCard, styles.selectedCard]}>
          <Card.Content>
            <Text>{placeToPlay}</Text>
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
