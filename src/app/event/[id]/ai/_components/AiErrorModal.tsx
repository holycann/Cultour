import Colors from "@/constants/Colors";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface AiErrorModalProps {
  visible: boolean;
  errorMessage: string;
  onDismiss: () => void;
}

export function AiErrorModal({
  visible,
  errorMessage,
  onDismiss,
}: AiErrorModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onDismiss}
    >
      <View style={styles.errorModalContainer}>
        <View style={styles.errorModalContent}>
          <Text style={styles.errorModalTitle}>Chat Error</Text>
          <Text style={styles.errorModalMessage}>{errorMessage}</Text>
          <TouchableOpacity style={styles.errorModalButton} onPress={onDismiss}>
            <Text style={styles.errorModalButtonText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  errorModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  errorModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  errorModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.error || "red",
    marginBottom: 15,
  },
  errorModalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  errorModalButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  errorModalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
