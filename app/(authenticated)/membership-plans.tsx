import { StyleSheet, Text, View } from 'react-native';

export default function MembershipPlans() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏡 Welcome to membership plans!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24 },
});
