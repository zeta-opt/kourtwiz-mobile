import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Divider,
  IconButton,
  Modal,
  Portal,
  Text,
} from 'react-native-paper';

type Props = {
  visible: boolean;
  handleClose: () => void;
  data: any;
};

const statusColorMap: Record<string, string> = {
  ACCEPTED: 'green',
  PENDING: 'orange',
  DECLINED: 'red',
};

const statusIconMap: Record<string, string> = {
  ACCEPTED: 'check-circle',
  PENDING: 'clock',
  DECLINED: 'close-circle',
};

const InviteSummaryModal = ({ visible, handleClose, data }: Props) => {
  console.log('data : ', data);
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={styles.container}
      >
        {data ? (
          <ScrollView>
            <Text style={styles.heading}>{data.placeToPlay}</Text>
            <Text>Date: {data.date}</Text>
            <Text>Skill Rating: {data.skillRating}</Text>

            <Divider style={{ marginVertical: 10 }} />
            <Text style={styles.subHeading}>Players</Text>

            {data.Requests?.map((player: any) => {
              const status = player.status?.toUpperCase() || 'PENDING';
              return (
                <View key={player.id} style={styles.playerRow}>
                  <IconButton
                    icon={statusIconMap[status] || 'help-circle'}
                    iconColor={statusColorMap[status] || 'gray'}
                    size={20}
                  />
                  <Text
                    style={[
                      styles.playerText,
                      { color: statusColorMap[status] || 'gray' },
                    ]}
                  >
                    {player.name}: {status}
                  </Text>
                </View>
              );
            })}

            <Button
              onPress={handleClose}
              mode='contained'
              style={{ marginTop: 20 }}
            >
              Close
            </Button>
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>No data to show.</Text>
        )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '500',
    color: 'gray',
    marginBottom: 8,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  playerText: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
    color: 'gray',
  },
});

export default InviteSummaryModal;
