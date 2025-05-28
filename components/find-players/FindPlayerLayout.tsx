// import { useGetPlayerInvitationSent } from '@/hooks/apis/player-finder/useGetPlayerInivitationsSent';
import { RootState } from '@/store';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, IconButton, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import {
  closePreferredPlaceModal,
  openPlayerFinderModal,
} from '../../store/uiSlice';
import MultiStepInviteModal from './FindPLayerMoadal';
import PreferredPlacesModal from './preferred-places-modal/PreferredPlacesModal';
const cardData = [
  {
    id: 1,
    clubName: 'Club Name 1',
    date: '2025 5 28',
    invited: 3,
    accepted: 0,
    status: 'pending',
  },
  {
    id: 2,
    clubName: 'Club Name 2',
    date: '2025 5 28',
    invited: 3,
    accepted: 0,
    status: 'pending',
  },
  {
    id: 3,
    clubName: 'Club Name 3',
    date: '2025 5 28',
    invited: 3,
    accepted: 0,
    status: 'completed',
  },
  {
    id: 4,
    clubName: 'Club Name 4',
    date: '2025 5 28',
    invited: 3,
    accepted: 0,
    status: 'completed',
  },
];

const FindPlayerLayout = () => {
  const dispatch = useDispatch();
  const { playerFinderModal, preferredPlaceModal } = useSelector(
    (state: RootState) => state.ui
  );
  // const { user } = useSelector((state: RootState) => state.auth);
  // const { data, refetch } = useGetPlayerInvitationSent({
  //   inviteeEmail: user?.email,
  // });
  // console.log('invites data : ', data);
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text variant='headlineMedium'>Invitation Sent</Text>
        <Text style={styles.description}>
          When you invite any player, the data will appear here.
        </Text>
      </View>

      <ScrollView style={styles.scrollArea}>
        {cardData.map((card) => (
          <Card key={card.id} style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.cardLeft}>
                <Text variant='titleMedium'>{card.clubName}</Text>
                <Text style={styles.blackText}>{card.date}</Text>
                <Text style={styles.greyText}>
                  {card.invited} players invited
                </Text>
                <Text style={styles.greenText}>
                  Accepted: {card.accepted}/{card.invited}
                </Text>
              </View>
              <View style={styles.cardRight}>
                <IconButton
                  icon={
                    card.status === 'pending'
                      ? 'clock-outline'
                      : 'check-circle-outline'
                  }
                  iconColor={card.status === 'pending' ? 'orange' : 'green'}
                  size={28}
                />
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
      <MultiStepInviteModal
        visible={playerFinderModal}
        refetch={() => {
          console.log('refetch');
        }}
      />
      <PreferredPlacesModal
        visible={preferredPlaceModal}
        handleClose={() => {
          dispatch(openPlayerFinderModal());
          dispatch(closePreferredPlaceModal());
        }}
      />
      <View style={styles.footer}>
        <Button
          mode='contained'
          icon='plus'
          onPress={() => {
            dispatch(openPlayerFinderModal());
          }}
        >
          Invite Players for new game
        </Button>
      </View>
    </View>
  );
};

export default FindPlayerLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  headerContainer: {
    marginBottom: 12,
  },

  description: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  scrollArea: {
    flex: 1,
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
    width: '100%',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flex: 1,
  },
  cardRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  blackText: {
    color: '#000',
  },
  greyText: {
    color: 'grey',
  },
  greenText: {
    color: 'green',
  },
  footer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
});
