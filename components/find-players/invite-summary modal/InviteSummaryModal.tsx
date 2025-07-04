import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Divider,
  IconButton,
  Modal,
  Portal,
  Text,
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { GetCommentPlayerFinder } from '../comment-layout/GetCommentPlayerFinder';
import { PostCommentPlayerFinder } from '../comment-layout/PostCommentPlayerFinder';

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
  const { user } = useSelector((state: RootState) => state.auth);
  const organizerName = data?.Requests?.[0]?.inviteeName ?? 'Unknown';
  const requestId = data?.requestId || data?.Requests?.[0]?.requestId;
  const userId = user?.userId || 'Unknown';

  const [refetchComments, setRefetchComments] = useState<() => void>(() => () => {});

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={styles.container}
      >
        {data ? (
          <>
            <View>
              <Text style={styles.heading}>{data.placeToPlay}</Text>
              <Text>Date: {data.date}</Text>
              <Text>Skill Rating: {data.skillRating}</Text>

              <Divider style={{ marginVertical: 10 }} />

              {/* Section: Players */}
              <Text style={styles.sectionLabel}>Players</Text>
              <View style={styles.playersContainer}>
                <ScrollView>
                  {data.Requests?.map((player: any) => {
                    const status = player.status?.toUpperCase() || 'PENDING';
                    return (
                      <View key={player.id} style={styles.row}>
                        <Text style={[styles.nameText, { color: statusColorMap[status] || 'gray' }]}>
                          {player.name}
                        </Text>
                        <View style={styles.roleInfo}>
                          <IconButton
                            icon={statusIconMap[status] || 'help-circle'}
                            iconColor={statusColorMap[status] || 'gray'}
                            size={18}
                          />
                          <Text style={{ color: statusColorMap[status] || 'gray' }}>{status}</Text>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Section: Organizer */}
              <Text style={styles.sectionLabel}>Organizer</Text>
              <View style={[styles.row, { marginTop: 4 }]}>
                <Text style={[styles.nameText, styles.organizerName]}>{organizerName}</Text>
                <Text style={[styles.organizerName]}>Organizer</Text>
              </View>

              {/* Comments */}
              {requestId && (
                <>
                  <Divider style={{ marginVertical: 10 }} />
                  <Text style={styles.subHeading}>Comments</Text>

                  <View style={styles.commentsContainer}>
                    <ScrollView>
                      <GetCommentPlayerFinder
                        requestId={requestId}
                        onRefetchAvailable={(ref) => setRefetchComments(() => ref)}
                      />
                    </ScrollView>
                  </View>
                </>
              )}

              {/* Add Comment */}
              {userId && requestId && (
                <>
                  <Divider style={{ marginVertical: 10 }} />
                  <PostCommentPlayerFinder
                    requestId={requestId}
                    userId={userId}
                    onSuccess={() => {
                      refetchComments();
                    }}
                  />
                </>
              )}

              <Button
                onPress={handleClose}
                mode="contained"
                style={styles.closeButton}
              >
                Close
              </Button>
            </View>
          </>
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
    maxHeight: '90%',
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'gray',
    marginBottom: 6,
    marginTop: 8,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '500',
    color: 'gray',
    marginBottom: 4,
  },
  playersContainer: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 5,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  nameText: {
    fontSize: 14,
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerName: {
    color: '#6a1b9a',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
    color: 'gray',
  },
  commentsContainer: {
    height: 200,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 5,
    marginBottom: 5,
  },
  closeButton: {
    marginTop: 2,
    borderRadius: 20,
  },
});

export default InviteSummaryModal;
