import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity>
          <Ionicons name="create-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <Image
          source={require('./assets/avatar.png')} // Placeholder image path
          style={styles.avatar}
        />
        <Text style={styles.name}>Thribhuvan-Chavala</Text>
        <TouchableOpacity>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
        <Text style={styles.info}>8187819281</Text>
        <Text style={styles.info}>thribhuvanch@yopmail.com</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ADDRESS</Text>
        <Text style={styles.sectionText}>603 Elk Street</Text>
        <Text style={styles.sectionText}>San Diego</Text>
        <Text style={styles.sectionText}>California</Text>
        <Text style={styles.sectionText}>United States</Text>
        <Text style={styles.sectionText}>92177</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date of Birth</Text>
          <Text style={styles.detailValue}>27 May 2025</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Gender</Text>
          <Text style={styles.detailValue}>Male</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9fb',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  logout: {
    color: 'red',
    marginBottom: 6,
  },
  info: {
    fontSize: 14,
    color: '#555',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#777',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 16,
    color: '#333',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});
