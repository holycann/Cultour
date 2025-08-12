import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

interface MapMarkerProps {
  color?: string;
  size?: number;
}

export const MapMarker: React.FC<MapMarkerProps> = ({
  color = "#4E7D79",
  size = 40,
}) => {
  return (
    <View style={styles.markerFixed}>
      <Ionicons name="pin" size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  markerFixed: {
    left: "50%",
    marginLeft: -12,
    marginTop: -24,
    position: "absolute",
    top: "50%",
  },
});
