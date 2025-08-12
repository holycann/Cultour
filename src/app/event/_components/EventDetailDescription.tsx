import React from "react";
import { Text, View } from "react-native";

export interface EventDetailDescriptionProps {
  description?: string;
}

export function EventDetailDescription({
  description,
}: EventDetailDescriptionProps) {
  return (
    <View className="mb-5">
      <Text className="text-xl font-bold text-[#17232F] mb-2">Description</Text>
      <Text className="text-[#5C6672]" style={{ textAlign: "justify" }}>
        {description
          ? description.split(". ").map((paragraph, index) => (
              <Text key={index}>
                {paragraph.trim()}
                {index < description.split(". ").length - 1 ? ".\n\n" : ""}
              </Text>
            ))
          : "No description available"}
      </Text>
    </View>
  );
}
