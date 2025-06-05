import { useGetPreferredPlaces } from '@/hooks/apis/player-finder/useGetPreferredPlaces';
import LoaderScreen from '@/shared/components/Loader/LoaderScreen';
import { RootState } from '@/store';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card, Modal, Portal, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { setPlaceToPlay } from '../../../store/playerFinderSlice';

type Props = {
  visible: boolean;
  handleClose: () => void;
};

const PreferredPlacesModal = ({ visible, handleClose }: Props) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, status } = useGetPreferredPlaces({ userId: user?.userId });
  const dispatch = useDispatch();
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={styles.modalContent}
      >
        <Text style={styles.heading}>Choose preferred places</Text>

        {status === 'loading' ? (
          <LoaderScreen />
        ) : (
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
          >
            {data &&
              data?.map((place) => (
                <Card
                  key={place.id}
                  style={styles.card}
                  onPress={() => {
                    dispatch(setPlaceToPlay(place.name));
                    handleClose();
                  }}
                >
                  <Card.Content>
                    <Text variant='titleMedium'>{place.name}</Text>
                    <Text style={styles.courtType}>{place.courtType}</Text>
                  </Card.Content>
                </Card>
              ))}
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );
};

export default PreferredPlacesModal;

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    maxHeight: '80%',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scrollArea: {
    maxHeight: 300, // Adjust as needed
  },
  scrollContent: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  courtType: {
    color: 'grey',
    marginTop: 4,
  },
});
