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
              <View style={styles.leftTextBlock}>
                <Text style={styles.placeText}>{gameInvite.placeToPlay}</Text>
                <Text style={styles.dateText}>{gameInvite.date}</Text>
                <Text style={styles.greenText}>
                  Accepted: {gameInvite.accepted} / {request?.playersNeeded}
                </Text>
              </View>
          
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
    justifyContent: 'space-between',
  },
  leftTextBlock: {
    flexShrink: 1,
    flex: 1,
  },
  placeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flexWrap: 'wrap',
  },
  dateText: {
    fontSize: 13,
    color: '#555',
    marginVertical: 2,
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
