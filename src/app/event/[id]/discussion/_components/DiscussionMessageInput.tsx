import { LoadingButton } from "@/components/ui/LoadingButton";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput, View } from "react-native";

export interface DiscussionMessageInputProps {
  query: string;
  onChangeQuery: (text: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
}

export function DiscussionMessageInput({
  query,
  onChangeQuery,
  onSendMessage,
  isLoading,
}: DiscussionMessageInputProps) {
  return (
    <View className="flex-row items-center px-4 py-3 bg-white border-t border-gray-200">
      <TextInput
        placeholder="Ketik pesan..."
        placeholderTextColor="#4E7D79"
        value={query}
        onChangeText={onChangeQuery}
        className="flex-1 bg-[#F0F0F0] rounded-xl px-4 py-2 mr-2 text-[#4E7D79]"
        multiline
      />
      <LoadingButton
        label=""
        onPress={onSendMessage}
        isLoading={isLoading}
        disabled={!query.trim()}
        className="rounded-full p-3 min-w-0 w-auto"
        style={{ paddingHorizontal: 12, paddingVertical: 12 }}
      >
        {!isLoading && <Ionicons name="send" size={20} color="white" />}
      </LoadingButton>
    </View>
  );
}
