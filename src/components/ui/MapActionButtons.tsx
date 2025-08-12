import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MapActionButtonsProps {
  onResetLocation: () => void;
  onSaveLocation: () => void;
}

export const MapActionButtons: React.FC<MapActionButtonsProps> = ({
  onResetLocation,
  onSaveLocation,
}) => {
  return (
    <View style={styles.actionButtonContainer}>
      <TouchableOpacity style={styles.resetButton} onPress={onResetLocation}>
        <Ionicons name="locate" size={24} color="#4E7D79" />
        <Text style={styles.actionButtonText}>My Location</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={onSaveLocation}>
        <Ionicons
          name="save"
          size={24}
          color="white"
          style={{ marginRight: 10 }}
        />
        <Text style={{ color: "white", marginLeft: 10 }}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resetButton: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  saveButton: {
    backgroundColor: "#4E7D79",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionButtonText: {
    marginLeft: 10,
    color: "#4E7D79",
    fontWeight: "bold",
  },
});
