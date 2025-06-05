import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Card, Text, useTheme, IconButton } from 'react-native-paper'; 
import RowDetailsModal from '../RowDetailsModal/RowDetailModal';

type Props = {
  columns: string[];
  rows: Record<string, string>[]; 
  modalTitle: string;
  onDelete?: (row: Record<string, string>) => void; 
};

const ViewOnlyList = ({ columns, rows, modalTitle, onDelete }: Props) => {
  const theme = useTheme();
  const [selectedRow, setSelectedRow] = useState<Record<string, string> | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = (row: Record<string, string>) => {
    setSelectedRow(row);
    setModalVisible(true);
  };

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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }} onTouchEnd={() => handlePress(row)}>
                {columns.map((col, i) => (
                  <View key={i} style={{ marginBottom: 5 }}>
                    <Text style={{ fontWeight: 'bold' }}>{col}:</Text>
                    <Text>{row[col]}</Text>
                  </View>
                ))}
              </View>
              {onDelete && (
                <IconButton
                  icon="delete"
                  iconColor={theme.colors.error}
                  onPress={() => onDelete(row)} 
                />
              )}
            </View>
          </Card.Content>
        </Card>
      ))}
      <RowDetailsModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        data={selectedRow}
        modalTitle={modalTitle}
      />
    </ScrollView>
  );
};

export default ViewOnlyList;

