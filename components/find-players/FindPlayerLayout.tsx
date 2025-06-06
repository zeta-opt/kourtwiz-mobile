import { groupInviteeByRequestId } from '@/helpers/find-players/groupInviteeByRequestId';
import { useGetPlayerInvitationSent } from '@/hooks/apis/player-finder/useGetPlayerInivitationsSent';
import { RootState } from '@/store';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, IconButton, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import {
  closePreferredPlaceModal,
  openPlayerFinderModal,
} from '../../store/uiSlice';
import ChooseContactsModal from './choose-contacts-modal/ChooseContactsModal';
import MultiStepInviteModal from './FindPLayerMoadal';
import InviteSummaryModal from './invite-summary modal/InviteSummaryModal';
import PreferredPlacesModal from './preferred-places-modal/PreferredPlacesModal';

const FindPlayerLayout = () => {
  const dispatch = useDispatch();
  const [selectedInvite, setSelectedInvite] = useState<any>(null);
  const [openInviteSummaryModel, setOpenInviteSummaryModel] = useState(false);
  const { playerFinderModal, preferredPlaceModal } = useSelector(
    (state: RootState) => state.ui
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, refetch } = useGetPlayerInvitationSent({
    inviteeEmail: user?.email,
  });
  const groupedInvites = groupInviteeByRequestId(data);
  const handleCloseInviteSummaryModel = () => {
    setOpenInviteSummaryModel(false);
  };
  // console.log('selectedInvite : ', selectedInvite);
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text variant='headlineMedium'>Invitation Sent</Text>
        <Text style={styles.description}>
          When you invite any player, the data will appear here.
        </Text>
      </View>

      <ScrollView style={styles.scrollArea}>
        {Object.values(groupedInvites).map((gameInvite) => (
          <Card
            key={gameInvite.requestId}
            style={styles.card}
            onPress={() => {
              console.log('Object.values(groupedInvites)[0] : ', gameInvite);
              setSelectedInvite(gameInvite);
              setOpenInviteSummaryModel(true);
            }}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.cardLeft}>
                <Text variant='titleMedium'>{gameInvite.placeToPlay}</Text>
                <Text style={styles.blackText}>{gameInvite.date}</Text>
                <Text style={styles.greyText}>
                  {gameInvite.Requests.length} players invited
                </Text>
                <Text style={styles.greenText}>
                  Accepted: {gameInvite.accepted}/{gameInvite.Requests.length}
                </Text>
              </View>
              <View style={styles.cardRight}>
                <IconButton
                  icon={
                    gameInvite.pending !== 0
                      ? 'clock-outline'
                      : 'check-circle-outline'
                  }
                  iconColor={gameInvite.pending !== 0 ? 'orange' : 'green'}
                  size={28}
                />
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
      <ChooseContactsModal />
      <MultiStepInviteModal visible={playerFinderModal} refetch={refetch} />
      <PreferredPlacesModal
        visible={preferredPlaceModal}
        handleClose={() => {
          dispatch(openPlayerFinderModal());
          dispatch(closePreferredPlaceModal());
        }}
      />
      <InviteSummaryModal
        data={selectedInvite}
        visible={openInviteSummaryModel}
        handleClose={handleCloseInviteSummaryModel}
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
