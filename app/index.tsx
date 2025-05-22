import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text variant='headlineMedium' style={styles.title}>
        Welcome to Kourtwiz
      </Text>

      <Button
        mode='contained'
        onPress={() => router.push('/login')}
        style={styles.button}
      >
        Login
      </Button>

      <Button
        mode='outlined'
        onPress={() => router.push('/signup')}
        style={styles.button}
      >
        Signup
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    marginVertical: 10,
  },
});
