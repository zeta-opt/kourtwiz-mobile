import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const PlayCalendarCard = ({ invites,onCancel,onWithdraw,onWithdrawSentRequest,onCancelInitiated, }: { invites: any[];onCancel: (invite: any) => void;onWithdraw: (invite: any) => void; onWithdrawSentRequest?: (invite: any) => void;onCancelInitiated?: (invite: any) => void; }) => {
  const router = useRouter();

  const renderStatusBadge = (status: string) => {
    let backgroundColor = '#e0e0e0';
    let textColor = '#000';

    switch (status?.toLowerCase()) {
      case 'accepted':
        backgroundColor = '#D3F5EF';
        textColor = '#229476';
        break;
      case 'pending':
        backgroundColor = '#FCECD9';
        textColor = '#D18F00';
        break;
      case 'waitlisted':
        backgroundColor = '#FEF3DC';
        textColor = '#B26A00';
        break;
      case 'declined':
        backgroundColor = '#FCE8E6';
        textColor = 'red';
        break;
    }

    return (
      <View style={[styles.badge, { backgroundColor }]}>
        <Text style={[styles.badgeText, { color: textColor }]}>
          {status}
        </Text>
      </View>
    );
  };

  const getDateObject = (invite: any): Date | null => {
    if (invite.type === 'incoming' && Array.isArray(invite.playTime)) {
      const [year, month, day, hour = 0, min = 0, sec = 0] = invite.playTime;
      return new Date(year, month - 1, day, hour, min, sec);
    } else if (invite.type === 'openplay' && Array.isArray(invite.playTime)) {
      const [year, month, day, hour = 0, min = 0] = invite.playTime;
      return new Date(year, month - 1, day, hour, min);
    } else if (invite.dateTimeMs) {
      return new Date(invite.dateTimeMs);
    }
    return null;
  };

  const now = new Date().setHours(0, 0, 0, 0);

  const sortedInvites = [...invites]
    .filter(invite => {
      const date = getDateObject(invite)?.getTime() || 0;
      return date >= now;
    })
    .sort((a, b) => {
      const dateA = getDateObject(a)?.getTime() || 0;
      const dateB = getDateObject(b)?.getTime() || 0;
      return dateA - dateB;
    });

  const renderInviteRow = (invite: any, index: number) => {
    const { type } = invite;
    const dateObj = getDateObject(invite);

    const place =
      invite.placeToPlay || invite.request?.placeToPlay || 'Unknown Location';

    const dateString = dateObj
      ? dateObj.toLocaleDateString("en-US", {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : 'Unknown';

    const timeString = dateObj
      ? dateObj.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Unknown';

    let statusText = 'Unknown';
    if (type === 'incoming') {
      statusText = invite.status || 'N/A';
    } else if (type === 'openplay') {
      statusText = invite.isRegistered ? 'Registered' : 'Not Registered';
    } else if (type === 'outgoing') {
      statusText = 'Sent';
    }
    else if (type === 'initiated') {
      statusText = 'Initiated';
    }


    const eventName =
      invite.eventName ||
      invite.request?.eventName ||
      (type === 'openplay' ? 'Unknown Play' : 'Event Name');

    const handlePress = () => {
      try {
        if (type === 'incoming') {
          router.push({
            pathname: '/(authenticated)/myRequestsDetailedView',
            params: { requestId: invite.requestId },
          });
        } else if (type === 'outgoing') {
          const encoded = encodeURIComponent(JSON.stringify(invite));
          router.push({
            pathname: '/(authenticated)/sentRequestsDetailedView',
            params: { data: encoded },
          });
        } else if (type === 'openplay' || type === 'initiated') {
          router.push({
            pathname: '/(authenticated)/openPlayDetailedView',
            params: { sessionId: invite.id },
          });
        }
      } catch (err) {
        console.error('Navigation error:', err);
      }
    };

    return (
      <TouchableOpacity key={index} style={styles.row} activeOpacity={0.8} onPress={handlePress}>
        <View style={{ flex: 1 }}>
          <View style={styles.rowTop}>
            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{eventName}</Text>
            {/* Chat icon next to event name */}
            {type === 'incoming' && (
              <>
              <TouchableOpacity
                style={{ marginLeft: 6 }}
                onPress={() => {
                  try {
                    router.push({
                      pathname: '/(authenticated)/chat-summary',
                      params: { requestId: invite.requestId },
                    });
                  } catch (err) {
                    console.error('Chat navigation error:', err);
                  }
                }}
              >
                <MaterialCommunityIcons name="message-text-outline" size={18} color="#007BFF" />
              </TouchableOpacity>
              <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => onCancel(invite)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
              
            )}
              {type === 'outgoing' && (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      router.push({
                        pathname: '/(authenticated)/chat-summary',
                        params: { requestId: invite.requestId },
                      });
                    }}
                  >
                    <MaterialCommunityIcons
                      name="message-text-outline"
                      size={18}
                      color="#007BFF"
                    />
                  </TouchableOpacity>

                  {onWithdrawSentRequest && (
                    <TouchableOpacity
                      style={styles.withdrawButton}
                      onPress={() => onWithdrawSentRequest(invite)}
                    >
                      <Text style={styles.withdrawButtonText}>Withdraw</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

            {type === 'openplay' && invite.isRegistered && (
              <>
              <TouchableOpacity
                onPress={() => {
                  router.push({ pathname: '/(authenticated)/chat-summary', params: { sessionId: invite.id } });
                }}
              >
                <MaterialCommunityIcons
                  name="message-text-outline"
                  size={18}
                  color="#007BFF"
                />
              </TouchableOpacity>
              <TouchableOpacity
                  style={styles.withdrawButton}
                  onPress={() => onWithdraw(invite)}
                >
                  <Text style={styles.withdrawButtonText}>Withdraw</Text>
                </TouchableOpacity>
              </>
            )}
            {type === 'initiated' && (
              <>
                <TouchableOpacity
                  onPress={() => {
                              router.push({ pathname: '/(authenticated)/chat-summary', params: { sessionId: invite.id } });
                            }}
                >
                  <MaterialCommunityIcons
                    name="message-text-outline"
                    size={18}
                    color="#007BFF"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.withdrawButton}
                  onPress={() => onCancelInitiated?.(invite)}
                >
                  <Text style={styles.withdrawButtonText}>Cancel Play</Text>
                </TouchableOpacity>
              </>
)}

          </View>

          <Text style={styles.subtitle}>
            {dateString} | {place}
          </Text>
        </View>
        <View style={styles.timeContainer}>
          <MaterialIcons name="access-time" size={16} color="#555" />
          <Text style={styles.timeText}>{timeString}</Text>
        </View>
      </TouchableOpacity>
      
    );
  };

  return (
    <View style={styles.container}>
      {sortedInvites
        .filter(invite => {
          if (invite.type === 'incoming') {
            // all accepted incoming requests
            return (invite.status || '').toLowerCase() === 'accepted';
          } else if (invite.type === 'outgoing') {
            // all sent requests (no filtering)
            return true;
          } else if (invite.type === 'openplay') {
            // registered openplay events only
            return invite.isRegistered === true;
          }
          else if (invite.type === 'initiated') {
            return true; // show all initiated plays
          }

          return false;
        })
        .map((invite, index) => renderInviteRow(invite, index))}
    </View>
  );
};

export default PlayCalendarCard;

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 16,
    gap: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    flexShrink: 1,      // shrink instead of pushing others
    maxWidth: '70%',
  },
  subtitle: {
    fontSize: 12,
    color: '#555',
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#555',
  },
  cancelButton: {
  backgroundColor: '#D32F2F',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 6,
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 10,
},
cancelButtonText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 12,
},
withdrawButton: {
  backgroundColor: '#D32F2F',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 6,
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 10,
},
withdrawButtonText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 12,
},


});
