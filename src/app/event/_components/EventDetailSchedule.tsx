import React from "react";
import { Text, View } from "react-native";

export interface EventDetailScheduleProps {
  startDate?: string | Date;
  endDate?: string | Date;
}

export function EventDetailSchedule({
  startDate,
  endDate,
}: EventDetailScheduleProps) {
  return (
    <View className="mb-8">
      <Text className="text-xl font-bold text-[#17232F] mb-2">Schedule</Text>
      <View className="flex-row items-center mb-2">
        <Text className="text-[#5C6672] font-bold mr-2">
          Start Date & Time:
        </Text>
        <Text className="text-[#5C6672]">
          {startDate ? new Date(startDate).toLocaleString() : "N/A"}
        </Text>
      </View>
      <View className="flex-row items-center">
        <Text className="text-[#5C6672] font-bold mr-2">End Date & Time:</Text>
        <Text className="text-[#5C6672]">
          {endDate ? new Date(endDate).toLocaleString() : "N/A"}
        </Text>
      </View>
    </View>
  );
}
