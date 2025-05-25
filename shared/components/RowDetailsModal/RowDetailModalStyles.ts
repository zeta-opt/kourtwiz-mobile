import { StyleSheet } from 'react-native';

export const getStyles = () =>
  StyleSheet.create({
    modalContainer: {
      margin: 20,
      borderRadius: 8,
    },
    detailRow: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    label: {
      fontWeight: 'bold',
      marginRight: 8,
      color: '#333',
    },
    value: {
      flexShrink: 1,
      color: '#555',
    },
  });
