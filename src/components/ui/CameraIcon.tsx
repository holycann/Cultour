import { Ionicons } from "@expo/vector-icons";
import React from "react";

interface CameraIconProps {
  size?: number;
  color?: string;
}

export function CameraIcon({ size = 24, color = "#4E7D79" }: CameraIconProps) {
  return <Ionicons name="camera-outline" size={size} color={color} />;
}
