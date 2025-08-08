import SetAvailabilityForm from '@/components/set-availability/SetAvailabilityForm';
import React from 'react';
import { View, StyleSheet } from 'react-native';
 
const SetAvailabilityPage = () => {
  return (
    <View style={styles.container}>
      <SetAvailabilityForm />
    </View>
  );
};
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
 
export default SetAvailabilityPage;