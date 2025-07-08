import { groupInviteeByRequestId } from '@/helpers/find-players/groupInviteeByRequestId';
import { useGetPlayerInvitationSent } from '@/hooks/apis/player-finder/useGetPlayerInivitationsSent';
import { useFilteredAndSortedInvites } from '@/hooks/playerfinder/filterInvitations';
import { RootState, AppDispatch } from '@/store';
import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { loadContacts } from '@/store/playerFinderSlice';
import {
  Button,
  Card,
  IconButton,
  Text,
  ToggleButton,
  useTheme,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import {
  closePreferredPlaceModal,
  openPlayerFinderModal,
  closeSearchPlaceModal,
} from '../../store/uiSlice';
import ChooseContactsModal from './choose-contacts-modal/ChooseContactsModal';
import MultiStepInviteModal from './FindPLayerMoadal';
import InviteSummaryModal from './invite-summary modal/InviteSummaryModal';
import PreferredPlacesModal from './preferred-places-modal/PreferredPlacesModal';
import SearchPlacesModal from './search-places-modal/SearchPlacesModal';

const FindPlayerLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();

  useEffect(() => {
    dispatch(loadContacts());
  }, [dispatch]);

  const [selectedInvite, setSelectedInvite] = useState<any>(null);
  const [openInviteSummaryModel, setOpenInviteSummaryModel] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isAscendingSort, setIsAscendingSort] = useState(true);

  const { playerFinderModal, preferredPlaceModal, searchPlaceModal } = useSelector(
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

  const handleSortIconPress = () => {
    setIsAscendingSort((prev) => !prev);
    console.log(
      `Sorting toggled. Now ${!isAscendingSort ? 'ascending' : 'descending'}.`
    );
  };

  const capitalizeFirstLetter = (str: string) => {
    if (typeof str !== 'string' || str.length === 0) {
      return '';
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const formatTimeArray = (timeArr: number[]) => {
    if (!Array.isArray(timeArr) || timeArr.length < 5) return 'Invalid Time';
    const [year, month, day, hour, minute] = timeArr;
    const date = new Date(year, month - 1, day, hour, minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerContainer}>
        <Text variant="headlineMedium" style={{ color: colors.onBackground }}>
          {capitalizeFirstLetter(filterStatus)} Invitations
        </Text>
        <IconButton
          icon={isAscendingSort ? 'arrow-up' : 'arrow-down'}
          size={24}
          onPress={handleSortIconPress}
          accessibilityLabel={
            isAscendingSort
              ? 'Sort ascending by date'
              : 'Sort descending by date'
          }
          iconColor={colors.primary}
        />
      </View>

      <View style={[styles.filterContainer, { backgroundColor: colors.surface }]}>
        <ToggleButton.Group
          onValueChange={(value) => setFilterStatus(value)}
          value={filterStatus}
        >
          <ToggleButton icon="format-list-bulleted" value="ALL" style={styles.toggleButton} />
          <ToggleButton icon="check-circle-outline" value="FULFILLED" style={styles.toggleButton} />
          <ToggleButton icon="clock-outline" value="UNFULFILLED" style={styles.toggleButton} />
        </ToggleButton.Group>
      </View>

      <ScrollView style={styles.scrollArea}>
        {Object.values(filteredGroupedInvites).length === 0 ? (
          <Text style={styles.noInvitesText}>
            No invites found for this filter.
          </Text>
        ) : (
          Object.values(filteredGroupedInvites).map((gameInvite) => {
            const request = gameInvite.Requests?.[0];

            return (
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
                    <Text variant="titleMedium" style={{ color: colors.onSurface }}>
                      {gameInvite.placeToPlay}
                    </Text>

                    {request?.playEndTime?.length ? (
                      <Text style={{ color: colors.onSurface }}>
                        {gameInvite.date} - {formatTimeArray(request.playEndTime)}
                      </Text>
                    ) : null}

                    <Text style={{ color: colors.outline }}>
                      {request.playersNeeded} players invited
                    </Text>

                    <Text style={{ color: 'green' }}>
                      Accepted: {gameInvite.accepted} / {request.playersNeeded}
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
            );
          })
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
      <SearchPlacesModal
        visible={searchPlaceModal}
        handleClose={() => {
          dispatch(openPlayerFinderModal());
          dispatch(closeSearchPlaceModal());
        }}
      />
      <InviteSummaryModal
        data={selectedInvite}
        visible={openInviteSummaryModel}
        handleClose={handleCloseInviteSummaryModel}
      />

      <View style={styles.footer}>
        <Button
          mode="contained"
          icon="plus"
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
  },
  headerContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 2,
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
  footer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
});
