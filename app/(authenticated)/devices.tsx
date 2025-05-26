import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

export default function Courts() {
  const [modalVisible, setModalVisible] = useState(false);
  console.log('modal : ', modalVisible);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Devices</Text>
        <Button mode='contained' onPress={() => setModalVisible(true)}>
          Add Device
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 5 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '5%',
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
