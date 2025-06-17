import { StyleSheet, Text, View } from 'react-native';

export default function MyPlay() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏡 Welcome to MyPlay!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24 },
});
