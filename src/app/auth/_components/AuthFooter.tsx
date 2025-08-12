import React from "react";
import { Text, View } from "react-native";

export interface AuthFooterProps {
  message: string;
  linkText: string;
  onLinkPress: () => void;
}

export function AuthFooter({
  message,
  linkText,
  onLinkPress,
}: AuthFooterProps) {
  return (
    <View className="items-center">
      <Text className="text-[#666] text-sm">
        {message}{" "}
        <Text className="text-blue-700" onPress={onLinkPress}>
          {linkText}
        </Text>
      </Text>
    </View>
  );
}
