import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import {
  Button,
  Divider,
  IconButton,
  Modal,
  Portal,
  Text,
} from 'react-native-paper';
import { GetCommentPlayerFinder } from '../comment-layout/GetCommentPlayerFinder';
import { PostCommentPlayerFinder } from '../comment-layout/PostCommentPlayerFinder';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

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
  const organizerName = data?.Requests?.[0]?.inviteeName ?? 'Unknown';
  const requestId = data?.requestId || data?.Requests?.[0]?.requestId;
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId || 'Unknown User';

  const players = data?.Requests ?? [];

  const commentMapRef = useRef<Map<string, string>>(new Map());

  const handleMapReady = (map: Map<string, string>) => {
    commentMapRef.current = map;
    console.log('📦 Exported comment map:', map);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={styles.container}
      >
        {data ? (
          <FlatList
            data={players}
            keyExtractor={(item: any) => item?.id ?? Math.random().toString()}
            contentContainerStyle={{ paddingBottom: 60 }}
            ListHeaderComponent={
              <>
                <Text style={styles.heading}>{data.placeToPlay}</Text>
                <Text>Date: {data.date}</Text>
                <Text>Skill Rating: {data.skillRating}</Text>
                <Divider style={{ marginVertical: 10 }} />
                <Text style={styles.subHeading}>Players</Text>
              </>
            }
            renderItem={({ item }: ListRenderItemInfo<any>) => {
              const status = item.status?.toUpperCase() || 'PENDING';
              return (
                <View style={styles.playerRow}>
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
                    {item.name}: {status}
                  </Text>
                </View>
              );
            }}
            ListFooterComponent={
              <View>
                <Divider style={{ marginVertical: 10 }} />
                <Text style={styles.subHeading}>Organizer</Text>
                <View style={styles.playerRow}>
                  <IconButton icon="account-circle" iconColor="#6a1b9a" size={20} />
                  <Text style={[styles.playerText, styles.organizerName]}>
                    {organizerName}
                  </Text>
                </View>

                {requestId && (
                  <>
                    <Divider style={{ marginVertical: 10 }} />
                    <Text style={styles.subHeading}>Comments</Text>
                   <GetCommentPlayerFinder
                    requestId={requestId}
                    userId={userId}
                    onMapReady={handleMapReady}
                  />
                  </>
                )}

                {userId && requestId && (
                  <>
                    <Divider style={{ marginVertical: 10 }} />
                    <PostCommentPlayerFinder
                      requestId={requestId}
                      userId={userId}
                      onSuccess={() => {
                        console.log('✅ Comment submitted!');
                      }}
                    />
                  </>
                )}

                <Button
                  onPress={handleClose}
                  mode="contained"
                  style={{ marginTop: 20 }}
                >
                  Close
                </Button>
              </View>
            }
          />
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
  organizerName: {
    color: '#6a1b9a',
    fontWeight: '600',
  },
});

export default InviteSummaryModal;
