import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

const LoaderScreen = () => {
  return (
    <View style={styles.loader}>
      <ActivityIndicator animating={true} size='large' />
    </View>
  );
};

export default LoaderScreen;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    color: '#2C7E88',
  },
});
