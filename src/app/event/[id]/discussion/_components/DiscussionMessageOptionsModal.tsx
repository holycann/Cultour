import { Message } from "@/types/Message";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

export interface DiscussionMessageOptionsModalProps {
  visible: boolean;
  message: Message | null;
  onEdit: (message: Message) => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function DiscussionMessageOptionsModal({
  visible,
  message,
  onEdit,
  onDelete,
  onCancel,
}: DiscussionMessageOptionsModalProps) {
  if (!message) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-4">
          <Pressable
            onPress={() => onEdit(message)}
            className="flex-row items-center py-3 border-b border-gray-200"
            android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
          >
            <MaterialIcons name="edit" size={24} color="#4E7D79" />
            <Text className="ml-3 text-[#4E7D79] text-base">Ubah Pesan</Text>
          </Pressable>
          <Pressable
            onPress={onDelete}
            className="flex-row items-center py-3"
            android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
          >
            <MaterialIcons name="delete" size={24} color="red" />
            <Text className="ml-3 text-red-500 text-base">Hapus Pesan</Text>
          </Pressable>
          <Pressable
            onPress={onCancel}
            className="mt-4 bg-[#F0F0F0] rounded-xl py-3 items-center"
            android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
          >
            <Text className="text-[#4E7D79] font-bold">Batal</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}