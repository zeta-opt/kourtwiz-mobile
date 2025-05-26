import React, { useState } from 'react';
import { Dimensions, ScrollView } from 'react-native';
import { DataTable, Text, useTheme } from 'react-native-paper';
import RowDetailsModal from '../RowDetailsModal/RowDetailModal';
import { getStyles } from './styles';

const { width: screenWidth } = Dimensions.get('window');

type Props = {
  columns: string[];
  rows: Record<string, string>[];
  DEFAULT_COLUMN_WIDTH: number;
  modalTitle: string;
};

const ViewOnlyTable = ({
  columns,
  rows,
  DEFAULT_COLUMN_WIDTH,
  modalTitle,
}: Props) => {
  const totalTableContentWidth = columns.length * DEFAULT_COLUMN_WIDTH;
  const theme = useTheme();
  const styles = getStyles(DEFAULT_COLUMN_WIDTH);
  const [selectedRow, setSelectedRow] = useState<Record<string, string> | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const handleRowPress = (row: Record<string, string>) => {
    setSelectedRow(row);
    setModalVisible(true);
  };

  return (
    <ScrollView style={styles.outerScrollContainer}>
      <ScrollView
        horizontal
        contentContainerStyle={styles.horizontalScrollContent}
        showsHorizontalScrollIndicator={true} // Show scroll indicator for better UX
      >
        <DataTable
          style={[
            styles.dataTable,
            {
              width: Math.max(screenWidth, totalTableContentWidth),
            },
          ]}
        >
          <DataTable.Header style={styles.tableHeader}>
            {columns.map((colName, idx) => (
              <DataTable.Title
                key={colName}
                style={{
                  ...styles.headerCell,
                  backgroundColor: theme.colors.primary,
                }}
              >
                <Text
                  style={{
                    ...styles.headerText,
                    color: '#fff',
                  }}
                >
                  {colName.toUpperCase()}
                </Text>
              </DataTable.Title>
            ))}
          </DataTable.Header>
          {rows.map((item, rowIdx) => (
            <DataTable.Row
              key={`row-${rowIdx}`}
              style={styles.dataRow}
              onPress={() => handleRowPress(item)}
            >
              {columns.map((colName, colIdx) => (
                <DataTable.Cell
                  key={`cell-${rowIdx}-${colIdx}`}
                  style={styles.dataCell}
                >
                  <Text
                    numberOfLines={1}
                    ellipsizeMode='tail'
                    style={styles.dataText}
                  >
                    {String(item[colName])}
                  </Text>
                </DataTable.Cell>
              ))}
            </DataTable.Row>
          ))}
        </DataTable>
        <RowDetailsModal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          data={selectedRow}
          modalTitle={modalTitle}
        />
      </ScrollView>
    </ScrollView>
  );
};

export default ViewOnlyTable;
