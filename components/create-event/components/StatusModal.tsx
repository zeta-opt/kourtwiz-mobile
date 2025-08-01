import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface EventStatusModalProps {
  visible: boolean;
  onClose: () => void;
  imageSource: any;
  title: string;
  description: string;
  buttonText: string;
  buttonColor?: string;
}

const StatusModal: React.FC<EventStatusModalProps> = ({
  visible,
  onClose,
  imageSource,
  title,
  description,
  buttonText,
  buttonColor = '#007BFF',
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={{ fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
          <Image source={imageSource} style={styles.image} resizeMode="contain" />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.button, { backgroundColor: buttonColor }]}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default StatusModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 300,
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
