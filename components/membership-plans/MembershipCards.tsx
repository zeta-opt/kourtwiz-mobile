import LoaderScreen from '@/shared/components/Loader/LoaderScreen';
import React from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

type Props = {
  currentClubId: string;
};

const perkLabels: Record<string, string> = {
  gymAccess: 'Gym Access',
  swimmingPool: 'Swimming Pool',
  sauna: 'Sauna Access',
  personalTrainer: 'Personal Trainer',
  spa: 'Spa Access',
};

const CARD_MARGIN = 13;
const CARD_WIDTH = (Dimensions.get('window').width - CARD_MARGIN * 3) / 2;
const perkLabelMap: Record<string, string> = {
  advanceBookingDays: 'Advance Booking Days',
  openPlaySessionsAllowed: 'Open Play Sessions',
  tournamentAccess: 'Tournament Access',
  guestPasses: 'Guest Passes',
  coachingSessions: 'Coaching Sessions',
};


  const theme = useTheme();
  if (status === 'loading') return <LoaderScreen />;

  const handleCardPress = (card: any) => {
    setSelectedCard(card);
  };  

  const renderCard = ({ item }: { item: any }) => (
    <Card style={[styles.card, { borderColor: theme.colors.primary }]}>
      <Card.Content>
        <Text variant='titleMedium'>{item.membershipName}</Text>
        <Text variant='bodyMedium'>Price: ${item.price}</Text>
        <Text variant='bodyMedium'>Duration: {item.duration}</Text>

        {item.perks && Object.values(item.perks).some((v) => v !== 0) && (
          <View style={styles.perksContainer}>
            <Text variant='bodyLarge' style={styles.perkHeader}>
              Perks:
            </Text>
            {Object.entries(item.perks)
              .filter(([, value]) => value !== 0)
              .map(([key, value]) => (
                <Text key={key}>
                  • {perkLabelMap[key] || key}: {String(value)}
                </Text>
              ))}
          </View>
        )}

      {item.customPerks?.filter((perk:any) => perk.name?.trim() !== '').length > 0 && (
        <View style={styles.perksContainer}>
          <Text variant='bodyLarge' style={styles.perkHeader}>
            Custom Perks:
          </Text>
          {item.customPerks
            .filter((perk: any) => perk.name?.trim() !== '')
            .map((perk: any, index: number) => (
              <Text key={index}>
                • {perk.name}: {perk.value}
              </Text>
            ))}
        </View>
      )}
      </Card.Content>
    </Card>
  );

  return (
    <FlatList
      data={clubMembershipData}
      renderItem={renderCard}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
    />
          <Pressable
            onPress={() => handleCardPress(item)}
            android_ripple={{ color: '#ddd' }}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            {renderCard({ item })}
          </Pressable>
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
      {/* Enlarge card in modal */}
      <Portal>
        <Modal
          transparent
          animationType="fade"
          visible={!!selectedCard}
          onRequestClose={() => setSelectedCard(null)}
        >
          <Pressable
            style={styles.backdrop}
            onPress={() => setSelectedCard(null)}
              accessible={true}
              accessibilityLabel="Tap to close the enlarged membership card view"
          >
          <View style={styles.centeredCard}>
            <Pressable onPress={() => {}} style={{ width: '100%' }}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Card style={styles.enlargedCard} accessible={true} accessibilityLabel={`Enlarged view of membership`}>
                  <Card.Content>
                    <Text variant="titleLarge" style={{ marginBottom: 8 }}>
                      {selectedCard?.membershipName}
                    </Text>
                    <Text variant="bodyMedium">Price: ${selectedCard?.price}</Text>
                    <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Duration: {selectedCard?.duration}</Text>

                    {selectedCard?.perks && Object.values(selectedCard.perks).some(v => v !== 0) && (
                      <>
                        <Text variant="bodyMedium">Perks:</Text>
                        {Object.entries(selectedCard.perks)
                          .filter(([, value]) => value !== 0)
                          .map(([key, value]) => (
                            <Text key={key}>
                              • {perkLabelMap[key] || key}: {String(value)}
                            </Text>
                          ))}
                      </>
                    )}

                    {selectedCard?.customPerks?.filter((p:any) => p.name?.trim() !== '')?.length > 0 && (
                      <>
                        <Text variant="bodyMedium" style={{ marginTop: 10 }}>
                          Custom Perks:
                        </Text>
                        {selectedCard.customPerks
                          .filter((perk: { name: string }) => perk.name?.trim() !== '')
                          .map((perk: { name: string; value: string | number }, index: number) => (
                            <Text key={index}>• {perk.name}: {perk.value}</Text>
                          ))}
                      </>
                    )}

                    <Pressable
                      onPress={() => setSelectedCard(null)}
                      style={{ marginTop: 12, alignSelf: 'flex-end' }}
                    >
                      <Text style={{ color: theme.colors.primary }}>Close</Text>
                    </Pressable>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: CARD_MARGIN,
    paddingBottom: CARD_MARGIN * 14,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: CARD_MARGIN * 2,
  },
  card: {
    width: CARD_WIDTH,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    margin: 2,
  },
  perksContainer: {
    marginTop: 8,
  },
  perkHeader: {
    marginBottom: 2,
    fontWeight: 600,
  },
});

export default MembershipCards;
