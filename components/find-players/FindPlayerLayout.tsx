import { groupInviteeByRequestId } from '@/helpers/find-players/groupInviteeByRequestId';
import { useGetPlayerInvitationSent } from '@/hooks/apis/player-finder/useGetPlayerInivitationsSent';
import { useFilteredAndSortedInvites } from '@/hooks/playerfinder/filterInvitations';
import { RootState } from '@/store';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  IconButton,
  Text,
  ToggleButton,
} from 'react-native-paper';
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
  const [filterStatus, setFilterStatus] = useState('ALL');
  // State to manage sorting visual (for UI only, no sorting logic yet)
  const [isAscendingSort, setIsAscendingSort] = useState(true);

  const { playerFinderModal, preferredPlaceModal } = useSelector(
    (state: RootState) => state.ui
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, refetch } = useGetPlayerInvitationSent({
    inviteeEmail: user?.email,
  });

  const groupedInvites = groupInviteeByRequestId(data);

  const filteredGroupedInvites = useFilteredAndSortedInvites(
    filterStatus,
    groupedInvites,
    isAscendingSort
  );
  const handleCloseInviteSummaryModel = () => {
    setOpenInviteSummaryModel(false);
  };

  // Function to toggle the sort icon and placeholder for actual sorting logic
  const handleSortIconPress = () => {
    setIsAscendingSort((prev) => !prev);
    // In a real scenario, you would trigger your data sorting logic here
    console.log(
      `Sorting toggled. Now ${!isAscendingSort ? 'ascending' : 'descending'}.`
    );
  };

  // Helper function to capitalize the first letter of a string
  const capitalizeFirstLetter = (str: string) => {
    if (typeof str !== 'string' || str.length === 0) {
      return '';
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text variant='headlineMedium'>
          {capitalizeFirstLetter(filterStatus)} Invitations
        </Text>
        {/* Clickable sorting icon */}
        <IconButton
          icon={isAscendingSort ? 'arrow-up' : 'arrow-down'} // Changes icon based on sorting state
          size={24}
          onPress={handleSortIconPress} // Toggles the icon state
          accessibilityLabel={
            isAscendingSort
              ? 'Sort ascending by date'
              : 'Sort descending by date'
          }
          iconColor='#000' // Set the color of the icon
        />
      </View>

      <View style={styles.filterContainer}>
        <ToggleButton.Group
          onValueChange={(value) => setFilterStatus(value)}
          value={filterStatus}
        >
          <ToggleButton
            icon='format-list-bulleted'
            value='ALL'
            style={styles.toggleButton}
            accessibilityLabel='Show all invites'
          />
          <ToggleButton
            icon='check-circle-outline'
            value='FULFILLED'
            style={styles.toggleButton}
            accessibilityLabel='Show fulfilled invites'
          />
          <ToggleButton
            icon='clock-outline'
            value='UNFULFILLED'
            style={styles.toggleButton}
            accessibilityLabel='Show unfulfilled invites'
          />
        </ToggleButton.Group>
      </View>

      <ScrollView style={styles.scrollArea}>
        {Object.values(filteredGroupedInvites).length === 0 ? (
          <Text style={styles.noInvitesText}>
            No invites found for this filter.
          </Text>
        ) : (
          Object.values(filteredGroupedInvites).map((gameInvite) => (
            <Card
              key={gameInvite.requestId}
              style={styles.card}
              onPress={() => {
                console.log('game invite : ', gameInvite);
                setSelectedInvite(gameInvite);
                setOpenInviteSummaryModel(true);
              }}
            >
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <Text variant='titleMedium'>{gameInvite.placeToPlay}</Text>
                  <Text style={styles.blackText}>{gameInvite.date}</Text>
                  <Text style={styles.greyText}>
                    {
                      gameInvite.Requests.filter(
                        (invite: any) => invite.status !== 'DECLINED'
                      ).length
                    } players invited
                    {
                      gameInvite.playersNeeded
                    } players invited
                  </Text>

                  <Text style={styles.greenText}>
                    Accepted: {gameInvite.accepted}/{gameInvite.playersNeeded}
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
          ))
        )}
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
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 2,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 0,
    borderWidth: 0,
  },
  noInvitesText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
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
