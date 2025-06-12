import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import useGetOpenPlaySessions from '@/hooks/apis/createPlay/useGetOpenPlaySessions';
import { CreateOpenPlayForm } from '../../components/create-play/CreateOpenPlayForm';
import CreateOpenPlayCards from '../../components/create-play/CreateOpenPlayCards';

const CreatePlayScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const currentClubId = user?.currentActiveClubId;

  const [renderKey, setRenderKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const {
    data: PlaySession = [],
    status,
    refetch,
  } = useGetOpenPlaySessions(currentClubId ?? '');
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
      <Text variant="headlineMedium" style={styles.headerText}>
        Play Sessions
      </Text>
      <Button 
        mode="contained" 
        onPress={() => setShowForm(true)}
      >
        + Create Play
      </Button>
    </View>

    <CreateOpenPlayCards
      key={renderKey}
      currentClubId={currentClubId}
      data={PlaySession ?? []}
      status={status}
    />
    {showForm && (
      <CreateOpenPlayForm
        visible={showForm}
        currentClubId={currentClubId}
        refetch={refetch}
        clubId={currentClubId}
        onClose={() => setShowForm(false)}
        onSuccess={() => {
          refetch();
          setRenderKey(prev => prev + 1);
          setShowForm(false);
        }}
      />
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 15,
  },
  cardActions: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  firstRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  secondRow: {
    width: '100%',
  },
  actionButton: {
    marginRight: 10,
    flex: 1,
  },
  cancelButton: {
    width: '100%',
  },
});

export default CreatePlayScreen;