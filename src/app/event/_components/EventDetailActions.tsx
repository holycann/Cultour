import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export interface EventDetailActionsProps {
  onUpdateEvent: () => void;
  onDeleteEvent: () => void;
}

export function EventDetailActions({
  onUpdateEvent,
  onDeleteEvent,
}: EventDetailActionsProps) {
  return (
    <View className="flex-row justify-end mb-2">
      <TouchableOpacity
        onPress={onUpdateEvent}
        className="bg-[#EEC887] rounded-xl py-2 px-4 items-center mr-2"
        style={{ minWidth: 100 }}
      >
        <Text className="text-[#1E1E1E] font-bold">Update</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onDeleteEvent}
        className="bg-red-500 rounded-xl py-2 px-4 items-center"
        style={{ minWidth: 100 }}
      >
        <Text className="text-black font-bold">Delete</Text>
      </TouchableOpacity>
    </View>
  );
}
