import React from 'react';
import { View, StyleSheet } from 'react-native';
import CreateEventForm from '../../components/create-event/CreateEventForm';
 
const CreateEventPage = () => {
  return (
    <View style={styles.container}>
      <CreateEventForm />
    </View>
  );
};
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
});
 
export default CreateEventPage;