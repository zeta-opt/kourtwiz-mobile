import React from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';

type Props = {
  columns: string[];
  rows: Record<string, string>[];
  onJoinPlay: (id: string) => void;
  loadingId: string | null;
};

const JoinPlayCards = ({ columns, rows, onJoinPlay, loadingId }: Props) => {
  const theme = useTheme();

  return (
    <ScrollView contentContainerStyle={{ padding: 10 }}>
      {rows.map((row, idx) => (
        <Card
          key={idx}
          style={{
            marginBottom: 10,
            backgroundColor: theme.colors.elevation.level1,
            borderRadius: 10,
          }}
        >
          <Card.Content>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <View style={{ flex: 1 }}>
                {columns.map((col, i) => (
                  <View key={i} style={{ marginBottom: 5 }}>
                    <Text style={{ fontWeight: 'bold' }}>
                      {col}: <Text>{row[col]}</Text>
                    </Text>
                  </View>
                ))}
              </View>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  marginLeft: 10,
                }}
              >
                <Button
                  mode='contained'
                  onPress={() => onJoinPlay(row.id)}
                  style={{ marginTop: 10 }}
                  disabled={!!row['buttonDisable']}
                  loading={row.id === loadingId}
                >
                  {!!row['buttonDisable'] ? 'Joined' : 'Join Play'}
                </Button>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
};

export default JoinPlayCards;
