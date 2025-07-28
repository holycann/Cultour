import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

import DetailHeader from "@/app/components/DetailHeader";
import { useEvent } from "@/hooks/useEvent";

export default function EventScreen() {
  const router = useRouter();
  const { events, isLoading: loading, error, fetchEvents } = useEvent();

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventDetail = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#FFF5E1] justify-center items-center">
        <ActivityIndicator size="large" color="#4E7D79" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-[#FFF5E1] justify-center items-center">
        <Text className="text-red-500">{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FFF5E1]">
      <DetailHeader title="Event" />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 20,
          paddingHorizontal: 24,
        }}
      >
        {events.map((event) => (
          <TouchableOpacity
            key={event.id}
            onPress={() => handleEventDetail(event.id)}
            className="mb-4 rounded-xl overflow-hidden"
          >
            <View className="bg-white rounded-xl shadow-md">
              <Image
                source={{ uri: event.image_url || "default_image_url" }}
                className="w-full h-48"
                resizeMode="cover"
              />
              <View className="p-4">
                <Text className="text-lg font-bold text-[#4E7D79]">
                  {event.name}
                </Text>
                <Text className="text-sm text-gray-600 mt-2">
                  {event.description}
                </Text>
                <View className="flex-row items-center mt-2">
                  <TouchableOpacity
                    onPress={() => handleEventDetail(event.id)}
                    className="flex-row items-center"
                  >
                    <Text className="text-[#EEC887] font-bold mr-2">
                      See Detail
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#EEC887"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
