import { StyleSheet, Text, View } from 'react-native';

export default function LiveUpdates() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏡 Welcome to Live Updates!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24 },
});
