import LoaderScreen from '@/shared/components/Loader/LoaderScreen';
import React, {useState, useEffect, useRef} from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, View, Modal, Animated } from 'react-native';
import { Card, Text, useTheme, Portal } from 'react-native-paper';

type Props = {
  currentClubId: string;
  data: any[];
  status: string;
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


const MembershipCards = ({ data, status }: Props) => {
  const theme = useTheme();

  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
    useEffect(() => {
      if (selectedCard) {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
    }, [selectedCard, scaleAnim]);

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
    <View>
      <FlatList
        data={data}
        renderItem={({ item }) => (
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
                    </Card.Content>
                  </Card>
                </Animated.View>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </Portal>
    </View>
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
    fontSize: 14,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  centeredCard: {
    width: '90%',
    maxWidth: 420,
    borderRadius: 16,
  },
  enlargedCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});

export default MembershipCards;
