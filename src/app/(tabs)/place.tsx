import Colors from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { useCity } from "@/hooks/useCity";
import { City } from "@/types/City";
import { MaterialIcons } from "@expo/vector-icons";
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
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlaceList() {
  const { cities, fetchCities, isLoading, error } = useCity();

  useEffect(() => {
    // Fetch locations if not already loaded
    if (cities.length === 0) {
      fetchCities();
    }
  }, [cities, fetchCities]);

  if (isLoading) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1 justify-center items-center bg-white"
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1 justify-center items-center bg-white"
      >
        <Text className="text-red-500">{error || "Failed to load places"}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
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
              className="w-[80px] h-[80px] rounded-xl mr-3"
              width={80}
              height={80}
              resizeMode="cover"
            />

            <View
              className="flex-1 flex-row items-center rounded-2xl py-4 px-5 min-h-[80px]"
              style={{
                backgroundColor: Colors.primary50,
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
                  {city.province?.name}
                </Text>
              </View>
              <Text className="text-2xl text-[#1A1A1A] font-bold opacity-50 ml-3">
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={20}
                  color="#1A1A1A"
                />
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
