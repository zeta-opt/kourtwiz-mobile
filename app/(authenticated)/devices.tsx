import { StyleSheet, Text, View } from 'react-native';

export default function Devices() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏡 Welcome to devices!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24 },
});
