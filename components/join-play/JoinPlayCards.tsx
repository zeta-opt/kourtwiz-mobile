import { MaterialCommunityIcons } from '@expo/vector-icons'; // or 'react-native-vector-icons/MaterialCommunityIcons'
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';

type Props = {
  columns: string[];
  rows: Record<string, string>[];
  onJoinPlay: (id: string, isFull: boolean) => void;
  loadingId: string | null;
};

const columnIcons: Record<string, React.ReactNode> = {
  date: <MaterialCommunityIcons name='calendar' size={16} />,
  time: <MaterialCommunityIcons name='clock-outline' size={16} />,
  duration: <MaterialCommunityIcons name='timer-outline' size={16} />,
  'skill level': <MaterialCommunityIcons name='chart-line' size={16} />,
  court: <MaterialCommunityIcons name='tennis' size={16} />,
  'max slots': <MaterialCommunityIcons name='account-multiple' size={16} />,
  'filled slots': <MaterialCommunityIcons name='account-check' size={16} />,
  action: <MaterialCommunityIcons name='play-circle-outline' size={16} />,
};

const JoinPlayCards = ({ columns, rows, onJoinPlay, loadingId }: Props) => {
  const theme = useTheme();

  const buttonMessage = (isRegistered: boolean, isFull: boolean): string => {
    if (!isRegistered && !isFull) {
      return 'Join Play';
    } else if (!isRegistered && isFull) {
      return 'Join Waitlist';
    } else {
      return 'Joined';
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {rows.map((row, idx) => (
        <Card key={idx} style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <View style={styles.column}>
                {columns.map((col, i) => (
                  <View key={i} style={styles.field}>
                    <Text style={styles.label}>
                      {columnIcons[col]} {col}: <Text>{row[col]}</Text>
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.buttonWrapper}>
                <Button
                  mode='contained'
                  onPress={() => onJoinPlay(row.id, !!row.isFull)}
                  style={styles.button}
                  disabled={!!row['isPlayerRegistered']}
                  loading={row.id === loadingId}
                >
                  {buttonMessage(!!row['isPlayerRegistered'], !!row.isFull)}
                </Button>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  card: {
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
  },
  field: {
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
  },
  buttonWrapper: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  button: {
    marginTop: 10,
  },
});

export default JoinPlayCards;
