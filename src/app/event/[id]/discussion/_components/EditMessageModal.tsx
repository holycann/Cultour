import { LoadingButton } from "@/components/ui/LoadingButton";
import React from "react";
import { Modal, Text, TextInput, View } from "react-native";

export interface EditMessageModalProps {
  isLoading: boolean;
  visible: boolean;
  message: string;
  onSave: () => void;
  onCancel: () => void;
  onChangeText: (text: string) => void;
}

export function EditMessageModal({
  isLoading,
  visible,
  message,
  onSave,
  onCancel,
  onChangeText,
}: EditMessageModalProps) {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center bg-black/50 p-4">
        <View className="bg-white rounded-2xl p-6">
          <Text className="text-xl font-bold text-[#4E7D79] mb-4">
            Edit Message
          </Text>

          <TextInput
            value={message}
            onChangeText={onChangeText}
            multiline
            className="border border-gray-300 rounded-xl p-4 mb-4 min-h-[100px] text-[#4E7D79]"
            placeholder="Edit your message..."
            placeholderTextColor="#4E7D79"
          />

          <View className="flex-row justify-between">
            <LoadingButton
              label="Cancel"
              onPress={onCancel}
              className="mr-2 flex-1 bg-gray-200"
              labelStyle={{ color: "#4E7D79" }}
            />

            <LoadingButton
              label="Save"
              onPress={onSave}
              isLoading={isLoading}
              disabled={!message.trim()}
              className="flex-1"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
