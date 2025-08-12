import { LoadingButton } from "@/components/ui/LoadingButton";
import React from "react";
import { Text, View } from "react-native";

export interface AiChatStartButtonProps {
  onStartChat: () => void;
  isLoading: boolean;
}

export function AiChatStartButton({
  onStartChat,
  isLoading,
}: AiChatStartButtonProps) {
  return (
    <View className="flex-1 justify-center items-center px-6">
      <Text className="text-2xl font-bold text-[#4E7D79] mb-4 text-center">
        Cultour
      </Text>
      <Text className="text-base text-[#4E7D79] mb-8 text-center">
        Smart Guide to Cultural Discovery
      </Text>

      <LoadingButton
        label="Start Chat"
        onPress={onStartChat}
        isLoading={isLoading}
        className="w-full"
      />
    </View>
  );
}
