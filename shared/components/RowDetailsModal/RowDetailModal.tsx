import React from 'react';
import { View } from 'react-native';
import { Button, Card, Modal, Portal, Text } from 'react-native-paper';
import { getStyles } from './RowDetailModalStyles';

type RowDetailsModalProps = {
  visible: boolean;
  onDismiss: () => void;
  data: Record<string, string> | null;
  modalTitle: string;
};

const RowDetailsModal = ({
  visible,
  onDismiss,
  data,
  modalTitle,
}: RowDetailsModalProps) => {
  const styles = getStyles();
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Card>
          <Card.Title title={modalTitle} />
          <Card.Content>
            {data ? (
              Object.entries(data).map(([key, value]) => (
                <View key={key} style={styles.detailRow}>
                  <Text style={styles.label}>{key}:</Text>
                  <Text style={styles.value}>{value}</Text>
                </View>
              ))
            ) : (
              <Text>No Data</Text>
            )}
          </Card.Content>
          <Card.Actions>
            <Button onPress={onDismiss}>Close</Button>
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  );
};

export default RowDetailsModal;
