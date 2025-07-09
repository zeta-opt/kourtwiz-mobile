import React from 'react';
import {StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

type OutgoingInvitationListProps = {
    invites: any[];
    onPressCard: (invite: any) => void;
  };
  
  export const OutgoingInvitationList: React.FC<OutgoingInvitationListProps> = ({
    invites,
    onPressCard,
  }) => {
    const router = useRouter();
    if (!invites || invites.length === 0) {
        return <Text style={styles.noInvitesText}>No outgoing invites</Text>;
    }

  return (
    <View>
      {invites.map((gameInvite) => {
        const request = gameInvite.Requests?.[0];
        return (
            <View
            key={gameInvite.requestId}
            style={styles.row}
            onTouchEnd={() => {
                const encoded = encodeURIComponent(JSON.stringify(gameInvite));
                router.push(`/invite-summary?data=${encoded}`);
              }}              
          >
            <View style={styles.fullLine}>
              <Text style={styles.lineText}>
                <Text style={{ fontWeight: 'bold' }}>{gameInvite.placeToPlay}</Text>
                {` - ${gameInvite.date} `}
                <Text style={styles.greenText}>
                  Accepted: {gameInvite.accepted} / {request?.playersNeeded}
                </Text>
              </Text>
          
              <IconButton
                icon={
                  gameInvite.pending !== 0 ? 'clock-outline' : 'check-circle-outline'
                }
                iconColor={gameInvite.pending !== 0 ? 'orange' : 'green'}
                size={20}
              />
            </View>
          </View>          
        );
      })}
    </View>
  );
};
const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderBottomColor: '#eee',
      borderBottomWidth: 1,
    },
    fullLine: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      },
      lineText: {
        fontSize: 14,
        color: '#333',
        flexShrink: 1,
        flexWrap: 'wrap',
      },
    textBlock: {
      flex: 1,
    },
    nameAndTime: {
      flexDirection: 'column',
      gap: 4,
    },
    name: {
      fontSize: 14,
      color: '#333',
      flexShrink: 1,
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    time: {
      fontSize: 12,
      color: '#666',
    },
    inviteStatusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    greenText: {
      color: 'green',
      fontSize: 13,
    },
    noInvitesText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      color: '#888',
    },
  });
  
