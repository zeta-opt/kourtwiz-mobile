import { StyleSheet, Text, View } from 'react-native';

export default function ClubBooking() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏡 Welcome to club booking!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24 },
});
