import React from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";

interface Participant {
  name: string;
  paid: boolean;
}

interface BookingDetailsPopupProps {
  members: Participant;
  guests: Participant[];
  onClose: () => void;
  visible: boolean;
}

const BookingDetailsPopup: React.FC<BookingDetailsPopupProps> = ({
  members,
  guests,
  onClose,
  visible,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.popupContent}>
          <Text style={styles.heading}>PLAYERS</Text>

          <View style={styles.section}>
            <Text style={styles.subheading}>Club Members</Text>
            <Text
              style={[
                styles.name,
                members.paid ? styles.paid : styles.unpaid,
              ]}
            >
              {members.name}
            </Text>
          </View>

          {guests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.subheading}>Guests</Text>
              <FlatList
                data={guests}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                  <Text
                    style={[
                      styles.name,
                      item.paid ? styles.paid : styles.unpaid,
                    ]}
                  >
                    {item.name}
                  </Text>
                )}
              />
            </View>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

export default BookingDetailsPopup;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    width: "85%",
    elevation: 5,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  section: {
    marginBottom: 12,
  },
  subheading: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  name: {
    fontSize: 14,
    marginVertical: 4,
  },
  paid: {
    color: "#10B981", // Green
  },
  unpaid: {
    color: "#EF4444", // Red
  },
  closeButton: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    marginTop: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
