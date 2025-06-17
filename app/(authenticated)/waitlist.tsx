import { StyleSheet, Text, View } from 'react-native';

export default function Waitlist() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏡 Welcome to Waitlist!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24 },
});
