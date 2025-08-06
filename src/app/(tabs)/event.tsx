import Colors from "@/constants/Colors";
import { useEvent } from "@/hooks/useEvent";
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

export default function EventScreen() {
  const { events, fetchEvents, isLoading, error } = useEvent();
  const router = useRouter();

  useEffect(() => {
    if (events.length === 0) {
      fetchEvents();
    }
  }, [events, fetchEvents]);

  const handleCreateEvent = () => {
    router.push("/event/add");
  };

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
        <Text className="text-red-500 text-center mt-5">
          {error || "Failed to load events"}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-5 pb-3">
        <Text className="text-2xl font-bold text-[#1E1E1E]"></Text>
        <TouchableOpacity
          className="bg-[#EEC887] px-4 py-2 rounded-lg"
          onPress={handleCreateEvent}
        >
          <Text className="text-black font-semibold">+ Create Event</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={false}
      >
        {events.map((event) => (
          <View
            key={event.id}
            className="bg-[#F3DDBF] rounded-2xl mb-5 shadow-md px-6 pt-6"
            style={{
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3.84,
            }}
          >
            <Image
              source={{ uri: event.image_url || "" }}
              className="w-full h-52 rounded-3xl "
              resizeMode="cover"
            />
            <View className="p-4">
              <Text className="text-xl font-bold text-[#1E1E1E] mb-4">
                {event.name}
              </Text>

              <TouchableOpacity
                onPress={() => router.push(`/event/${event.id}`)}
                className="bg-[#EEC887] px-6 py-2 rounded-full self-start"
              >
                <View className="bg-[#EEC887] rounded-full">
                  <Text className="text-[#1E1E1E] font-semibold text-sm">
                    See Detail
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
