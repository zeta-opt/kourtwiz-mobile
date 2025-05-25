import { StyleSheet } from 'react-native';

export const getStyles = (DEFAULT_COLUMN_WIDTH: number) => {
  const styles = StyleSheet.create({
    outerScrollContainer: {
      flex: 1,
      maxHeight: '80%',
    },
    horizontalScrollContent: {},
    dataTable: {
      backgroundColor: '#fff',
      borderRadius: 8,
      overflow: 'hidden',
      elevation: 2, // Android shadow
      shadowColor: '#000', // iOS shadow
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },
    tableHeader: { paddingHorizontal: 0 },
    headerCell: {
      minWidth: DEFAULT_COLUMN_WIDTH,
      justifyContent: 'center',
      color: '#000',
    },
    headerText: {
      fontWeight: 'bold',
      color: '#333',
      fontSize: 14,
      textAlign: 'center',
    },
    dataRow: {
      borderBottomWidth: 0.5,
      borderBottomColor: '#eee',
    },
    dataCell: {
      minWidth: DEFAULT_COLUMN_WIDTH,
      justifyContent: 'center',
      paddingHorizontal: 8,
      borderRightWidth: 0.5,
      borderRightColor: '#eee',
    },
    dataText: {
      fontSize: 13,
      color: '#555',
      textAlign: 'center',
    },
  });
  return styles;
};
