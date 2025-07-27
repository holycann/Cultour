import { useBadge } from "@/hooks/useBadge";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, StatusBar, Text, TouchableOpacity, View } from "react-native";

export default function BadgeScreen() {
  const router = useRouter();
  const { badges, isLoading, error, fetchBadges } = useBadge();

  useEffect(() => {
    fetchBadges();
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: "#F9EFE4" }}>
        <Text className="text-[#4E7D79]">Loading badges...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: "#F9EFE4" }}>
        <Text className="text-red-500">Error: {error}</Text>
        <TouchableOpacity onPress={fetchBadges} className="mt-4">
          <Text className="text-[#4E7D79]">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: "#F9EFE4" }}>
      <StatusBar backgroundColor="#F9EFE4" barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center p-4">
        <TouchableOpacity onPress={handleGoBack} className="mr-4">
          <Text className="text-[#4E7D79] text-lg">{"<"}</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#4E7D79]">Badge</Text>
      </View>

      {/* Konten Badge */}
      <View className="px-4 mt-4">
        <Text className="text-2xl font-bold text-[#4E7D79] mb-4">Badge</Text>

        <View
          className="bg-white rounded-xl p-4"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <View className="flex-row justify-between">
            {badges.map((badge) => (
              <View key={badge.id} className="items-center w-[45%]">
                <Image
                  source={{ uri: badge.icon_url }}
                  className="w-32 h-32"
                  resizeMode="contain"
                />
                <Text className="mt-2 text-base font-bold text-[#4E7D79]">
                  {badge.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
