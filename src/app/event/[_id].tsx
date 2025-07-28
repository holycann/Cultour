import { useEvent } from "@/hooks/useEvent";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Icon } from "@iconify/react";
import DetailHeader from "@/app/components/DetailHeader";
import React, { useEffect } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function EventDetailScreen() {
  const router = useRouter();
  const { _id: eventID } = useLocalSearchParams<{ _id: string }>();
  const { event, getEventById, fetchSingleEvent } = useEvent();

  useEffect(() => {
    if (eventID) {
      const localEvent = getEventById(eventID);
      if (!localEvent) {
        fetchSingleEvent(eventID);
      }
    }
  }, [eventID]);

  if (!event) {
    return (
      <View className="flex-1 bg-[#EEC887] justify-center items-center">
        <Text className="text-[#4E7D79]">Loading event...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#EEC887]">
      <DetailHeader title="Detail Event" />

      <View className="flex-1 bg-white rounded-t-3xl pt-8 px-5">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Event Card */}
          <View className="items-center mb-6">
            <View className="w-[90%] rounded-3xl bg-[#F3DDBF] p-4">
              {/* Gambar */}
              <Image
                source={{
                  uri: event.image_url || "https://via.placeholder.com/350x200",
                }}
                className="w-full h-48 rounded-2xl mb-4"
                resizeMode="cover"
              />

              {/* Text */}
              <Text className="text-lg font-semibold text-[#1E1E1E] mb-1">
                {event.name}
              </Text>
              <Text className="text-sm text-[#666]">📍 {event.location}</Text>
            </View>
          </View>

          {/* Description */}
          <View className="mb-5">
            <Text className="text-xl font-bold text-[#17232F] mb-2">
              Description
            </Text>
            <Text className="text-[#5C6672]">{event.description}</Text>
          </View>

          {/* Schedule */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-[#17232F] mb-2">
              Schedule
            </Text>
            <View className="flex-row items-center mb-2">
              <Text className="text-[#5C6672] font-bold mr-2">
                Start Date & Time:
              </Text>
              <Text className="text-[#5C6672]">
                {event.start_date
                  ? new Date(event.start_date).toLocaleString()
                  : "N/A"}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-[#5C6672] font-bold mr-2">
                End Date & Time:
              </Text>
              <Text className="text-[#5C6672]">
                {event.end_date
                  ? new Date(event.end_date).toLocaleString()
                  : "N/A"}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row justify-between mb-10">
            <View className="flex-1 mr-2">
              <TouchableOpacity
                onPress={() => router.push(`/event/${event.id}/chat`)}
                className="bg-[#EEC887] rounded-xl py-3 px-6 items-center"
              >
                <Text className="text-[#1E1E1E] font-bold">Ask AI</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-1 ml-2">
              <TouchableOpacity
                onPress={() => router.push(`/event/${event.id}/discussion`)}
                className="bg-[#EEC887] rounded-xl py-3 px-6 items-center"
              >
                <Text className="text-[#1E1E1E] font-bold">Discussion</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
