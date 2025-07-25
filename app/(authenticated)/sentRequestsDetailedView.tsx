import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useWithdrawRequest } from '@/hooks/apis/player-finder/useWithdrawRequest';
import Toast from 'react-native-toast-message';
import { Modal, Portal, Button } from 'react-native-paper';

const statusColorMap: Record<string, string> = {
  ACCEPTED: 'green',
  PENDING: 'orange',
  DECLINED: 'red',
  WITHDRAWN: 'gray',
};

const statusIconMap: Record<string, string> = {
  ACCEPTED: 'check-circle',
  PENDING: 'clock',
  DECLINED: 'times-circle',
  WITHDRAWN: 'minus-circle',
};

function arrayToDate(arr: number[]): Date {
  if (!arr || arr.length < 6) return new Date();
  return new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
}

export default function SentRequestDetailedView() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.userId;

  const [invite, setInvite] = useState<any | null>(null);
  const [withdrawComment, setWithdrawComment] = useState('');
  const [commentModalVisible, setCommentModalVisible] = useState(false);

  const { withdrawRequest, status } = useWithdrawRequest();

  useEffect(() => {
    if (data) {
      try {
        const decoded = JSON.parse(decodeURIComponent(data));
        setInvite(decoded);
      } catch (err) {
        console.error('Failed to decode invite data:', err);
      }
    }
  }, [data]);

  if (!invite) return <ActivityIndicator size="large" style={styles.loader} />;

  const playTime = arrayToDate(invite?.Requests?.[0]?.playTime || []);
  const dateString = playTime.toLocaleDateString();
  const timeString = playTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const requestId = invite?.requestId || invite?.Requests?.[0]?.requestId;
  const organizerName = invite?.Requests?.[0]?.inviteeName ?? 'Unknown';
  const total = invite?.playersNeeded || 0;
  const accepted = invite?.Requests?.filter((r: any) => r.status === 'ACCEPTED').length || 0;

  const handleWithdraw = async () => {
    try {
      console.log('Withdraw request triggered with:');
      console.log('Request ID:', requestId);
      console.log('User ID:', userId);
      console.log('Comment:', withdrawComment);
      
      await withdrawRequest(requestId, userId, withdrawComment);
      Toast.show({ type: 'success', text1: 'Game Invite Withdrawn' });
      setCommentModalVisible(false);
      router.replace('/(authenticated)/find-players');
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to Withdraw Game Invite' });
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Sent Request</Text>
        <View style={{ width: 36 }} />
      </View>

      <Text style={styles.subheading}>{organizerName} Invited To Play</Text>

      {/* Info Card */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.column}>
            <View style={styles.infoCard}>
              <FontAwesome5 name="calendar-alt" size={20} color="#2CA6A4" />
            </View>
            <Text style={styles.infoText}>{dateString}</Text>
          </View>
          <View style={styles.column}>
            <View style={styles.infoCard}>
              <FontAwesome5 name="clock" size={20} color="#2CA6A4" />
            </View>
            <Text style={styles.infoText}>{timeString}</Text>
          </View>
          <View style={styles.column}>
            <View style={styles.infoCard}>
              <FontAwesome5 name="users" size={20} color="#2CA6A4" />
            </View>
            <Text style={styles.infoText}>{accepted}/{total} Accepted</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <View style={styles.locationIconWrapper}>
            <FontAwesome5 name="map-marker-alt" size={16} color="#2CA6A4" />
          </View>
          <Text style={styles.locationText}>Event Place: {invite.placeToPlay}</Text>
        </View>
      </View>

      {/* Player List */}
      <Text style={[styles.subheading, { marginTop: 20 }]}>Players</Text>
      <View style={styles.card}>
        <ScrollView
          style={{ maxHeight: 220 }}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          {invite?.Requests?.map((player: any) => {
            const status = player.status?.toUpperCase() || 'PENDING';
            return (
              <View key={player.id} style={styles.row}>
                <Text style={{ color: statusColorMap[status], fontWeight: '500' }}>
                  {player.name}
                </Text>
                <View style={styles.row}>
                  <FontAwesome5
                    name={statusIconMap[status] || 'question'}
                    size={14}
                    color={statusColorMap[status]}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={{ color: statusColorMap[status] }}>{status}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Chat Preview + Join Button */}
      <View style={styles.chatPreviewContainer}>
        <Text style={styles.chatPreviewText}>Chat with players here...</Text>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() =>
            router.push({
              pathname: '/(authenticated)/incoming-summarty',
              params: { requestId: invite.requestId }, // or whatever variable holds it
            })
          }
        >
          <Text style={styles.joinButtonText}>Join Chat</Text>
        </TouchableOpacity>
        </View>

      {/* Withdraw Button */}
      <View style={styles.withdrawContainer}>
        <Text style={styles.chatPreviewText}>Withdraw the game for all...</Text>

        <TouchableOpacity
          style={[
            styles.joinButton,
          ]}
          onPress={() => {
            setCommentModalVisible(true);
          }}
        >
          <Text style={styles.joinButtonText}>Withdraw Request</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Portal>
        <Modal
          visible={commentModalVisible}
          onDismiss={() => setCommentModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Withdraw Game Invite</Text>
          <TextInput
            placeholder="Optional comment"
            multiline
            numberOfLines={4}
            value={withdrawComment}
            onChangeText={setWithdrawComment}
            style={styles.input}
          />
          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={() => setCommentModalVisible(false)}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleWithdraw}
              loading={status === 'loading'}
              disabled={status === 'loading'}
              style={{ flex: 1, marginLeft: 10 }}
            >
              Confirm
            </Button>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
  },
  subheading: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
    alignItems: 'center',
  },
  column: {
    alignItems: 'center',
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#E6F7F7',
    padding: 10,
    borderRadius: 30,
    alignItems: 'center',
    width: '40%',
  },
  infoText: {
    marginTop: 4,
    fontSize: 13,
    color: '#333',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 28,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#444',
  },
  locationIconWrapper: {
    backgroundColor: '#E6F7F7',
    padding: 8,
    borderRadius: 30,
  },
  joinButton: {
    backgroundColor: '#007A7A',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  chatPreviewContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 16,
    elevation: 2,
  },
  chatPreviewText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  withdrawContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 6,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    borderColor: '#aaa',
  },  
});