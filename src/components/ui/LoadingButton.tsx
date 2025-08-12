import React, { ReactNode } from "react";
import {
    ActivityIndicator,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from "react-native";

export interface LoadingButtonProps {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  loadingColor?: string;
  children?: ReactNode;
}

export function LoadingButton({
  label,
  onPress,
  isLoading = false,
  disabled = false,
  className = "",
  style,
  labelStyle,
  loadingColor = "white",
  children,
}: LoadingButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading || disabled}
      className={`bg-[#4E7D79] rounded-xl py-3 px-6 items-center ${className}`}
      style={[
        {
          opacity: isLoading || disabled ? 0.5 : 1,
          flexDirection: "row",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={loadingColor} size="small" />
      ) : (
        children || (
          <Text className="text-white font-bold text-base" style={labelStyle}>
            {label}
          </Text>
        )
      )}
    </TouchableOpacity>
  );
}
