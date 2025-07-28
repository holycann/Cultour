import Colors from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { useCity } from "@/hooks/useCity";
import { City } from "@/types/City";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PlaceList() {
  const { cities, fetchCities, isLoading, error } = useCity();

  useEffect(() => {
    // Fetch locations if not already loaded
    if (cities.length === 0) {
      fetchCities();
    }
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500">{error || "Failed to load places"}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="mb-4 text-[#1A1A1A]" style={Typography.styles.title}>
          Places
        </Text>

        {cities.map((city: City) => (
          <TouchableOpacity
            key={city.id}
            className="flex-row items-center mb-6"
            onPress={() => router.push(`/place/${city.id}`)}
          >
            <Image
              source={{ uri: city.image_url || "" }}
              className="w-[72px] h-[72px] rounded-xl mr-3 border"
              style={{
                backgroundColor: Colors.primary50,
                borderColor: Colors.primary,
              }}
              resizeMode="cover"
            />

            <View
              className="flex-1 flex-row items-center rounded-2xl py-4 px-5 shadow-sm min-h-[72px]"
              style={{
                backgroundColor: Colors.primary50,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="flex-1">
                <Text
                  className="text-[#1A1A1A]"
                  style={Typography.styles.subtitle}
                >
                  {city.name}
                </Text>
                <Text
                  className="text-[#1A1A1A] opacity-70"
                  style={Typography.styles.body}
                >
                  {city.Province?.name}
                </Text>
              </View>
              <Text className="text-2xl text-[#1A1A1A] font-bold opacity-50 ml-3">
                {">"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
