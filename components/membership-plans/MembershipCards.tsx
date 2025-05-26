import { useGetMembershipsByClubId } from '@/hooks/apis/memberships/useGetmembershipsByClubId';
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

const MembershipCards = ({ currentClubId }: Props) => {
  const theme = useTheme();
  const { data: clubMembershipData = [] } = useGetMembershipsByClubId(
    currentClubId ?? ''
  );

  const renderCard = ({ item }: { item: any }) => (
    <Card style={[styles.card, { borderColor: theme.colors.primary }]}>
      <Card.Content>
        <Text variant='titleMedium'>{item.membershipName}</Text>
        <Text variant='bodySmall'>Price: ${item.price}</Text>
        <Text variant='bodySmall'>Duration: {item.duration}</Text>

        {item.perks && Object.values(item.perks).some((v) => v !== 0) && (
          <View style={styles.perksContainer}>
            <Text variant='bodySmall' style={styles.perkHeader}>
              Perks:
            </Text>
            {Object.entries(item.perks)
              .filter(([, value]) => value !== 0)
              .map(([key, value]) => (
                <Text key={key}>
                  • {perkLabels[key] ?? key}: {String(value)}
                </Text>
              ))}
          </View>
        )}

        {item.customPerks?.length > 0 && (
          <View style={styles.perksContainer}>
            <Text variant='bodySmall' style={styles.perkHeader}>
              Custom Perks:
            </Text>
            {item.customPerks.map((perk: any, index: number) => (
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
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: CARD_MARGIN,
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
    marginTop: 6,
  },
  perkHeader: {
    marginBottom: 2,
    fontWeight: 'bold',
  },
});

export default MembershipCards;
