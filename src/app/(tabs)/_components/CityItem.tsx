import Colors from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { City } from "@/types/City";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export interface CityItemProps {
  city: City;
}

export function CityItemComponent({ city }: CityItemProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center mb-6"
      onPress={() => router.push(`/place/${city.id}`)}
    >
      <Image
        source={{ uri: city.image_url || "" }}
        style={{ width: 80, height: 80, borderRadius: 12, marginRight: 12 }}
        placeholder={require("@/assets/images/adaptive-icon.png")}
        contentFit="cover"
        transition={300}
        priority="low"
        recyclingKey={`city-${city.id}`}
      />

      <View
        className="flex-1 flex-row items-center rounded-2xl py-4 px-5 min-h-[80px]"
        style={{
          backgroundColor: Colors.primary50,
        }}
      >
        <View className="flex-1">
          <Text className="text-[#1A1A1A]" style={Typography.styles.subtitle}>
            {city.name}
          </Text>
          <Text
            className="text-[#1A1A1A] opacity-70"
            style={Typography.styles.body}
          >
            {city.province?.name}
          </Text>
        </View>
        <Text className="text-2xl text-[#1A1A1A] font-bold opacity-50 ml-3">
          <MaterialIcons name="arrow-forward-ios" size={20} color="#1A1A1A" />
        </Text>
      </View>
    </TouchableOpacity>
  );
}

CityItemComponent.displayName = "CityItem";
export const CityItem = React.memo(CityItemComponent);
