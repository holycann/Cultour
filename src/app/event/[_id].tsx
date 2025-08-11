import DetailHeader from "@/app/components/DetailHeader";
import { useAuth } from "@/hooks/useAuth";
import { useEvent } from "@/hooks/useEvent";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EventDetailScreen() {
  const router = useRouter();
  const { _id: eventID } = useLocalSearchParams<{ _id: string }>();
  const { event, getEventById, deleteEvent, updateEventViews, isLoading } =
    useEvent();
  const { user } = useAuth();

  const [isCreator, setIsCreator] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (eventID) {
        if (!isLoading) {
          await getEventById(eventID);

          if (!isDeleting) {
            await updateEventViews(eventID);
          }
        }
      }
    };

    fetchEventDetails();
  }, [eventID, event, isLoading]);

  useEffect(() => {
    // Check if the current user is the event creator
    if (event && user) {
      setIsCreator(event.creator?.id === user.id);
    }
  }, [event, user]);

  const handleDeleteEvent = () => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (eventID) {
            const success = await deleteEvent(eventID);
            if (success) {
              setIsDeleting(true);
              router.replace("/(tabs)/event");
            }
          }
        },
      },
    ]);
  };

  const handleUpdateEvent = () => {
    router.push(`/event/edit?eventId=${eventID}`);
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-[#EEC887]"
    >
      <DetailHeader title="Detail Event" />

      {!event || event.id !== eventID ? (
        <View className="flex-1 justify-center items-center bg-white rounded-t-3xl pt-8 px-6">
          <ActivityIndicator size="large" color="#4E7D79" />
        </View>
      ) : (
        <View className="flex-1 bg-white rounded-t-3xl pt-8 px-5">
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Update & Delete Buttons for Creator (above card image) */}
            {isCreator && (
              <View className="flex-row justify-end mb-2">
                <TouchableOpacity
                  onPress={handleUpdateEvent}
                  className="bg-[#EEC887] rounded-xl py-2 px-4 items-center mr-2"
                  style={{ minWidth: 100 }}
                >
                  <Text className="text-[#1E1E1E] font-bold">Update</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDeleteEvent}
                  className="bg-red-500 rounded-xl py-2 px-4 items-center"
                  style={{ minWidth: 100 }}
                >
                  <Text className="text-black font-bold">Delete</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Event Card */}
            <View className="items-center mb-6">
              <View className="w-[90%] rounded-3xl bg-[#F3DDBF] p-4">
                {/* Gambar */}
                <Image
                  source={{
                    uri: event.image_url || "https://placehold.co/350x200",
                  }}
                  className="w-full h-48 rounded-2xl mb-4"
                  resizeMode="cover"
                />

                {/* Text */}
                <Text className="text-lg font-semibold text-[#1E1E1E] mb-1">
                  {event.name}
                </Text>
                <View className="flex-row items-start">
                  <Text className="text-sm text-[#666] mr-2">📍</Text>
                  <Text className="text-sm text-[#666] flex-1">
                    {event.location?.name || "Location not specified"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Views */}
            <View className="flex-row items-center my-2">
              <Ionicons
                name="eye"
                size={18}
                color="#666"
                style={{ marginRight: 6 }}
              />
              <Text className="text-sm text-[#666]">
                {event.views?.views || 0} Views
              </Text>
            </View>

            {/* Description */}
            <View className="mb-5">
              <Text className="text-xl font-bold text-[#17232F] mb-2">
                Description
              </Text>
              <Text className="text-[#5C6672]" style={{ textAlign: "justify" }}>
                {event.description
                  ? event.description.split(". ").map((paragraph, index) => (
                      <Text key={index}>
                        {paragraph.trim()}
                        {index < event.description.split(". ").length - 1
                          ? ".\n\n"
                          : ""}
                      </Text>
                    ))
                  : "No description available"}
              </Text>
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
                  onPress={() => router.push(`/event/${event.id}/ai`)}
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
      )}
    </SafeAreaView>
  );
}
