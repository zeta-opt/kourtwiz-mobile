import { StyleSheet, Text, View } from 'react-native';

export default function Courts() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏡 Welcome to courts!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24 },
});
