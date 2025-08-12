import DetailHeader from "@/app/_components/DetailHeader";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { useEvent } from "@/hooks/useEvent";
import notify from "@/services/notificationService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EventDetailActions } from "./_components/EventDetailActions";
import { EventDetailDescription } from "./_components/EventDetailDescription";
import { EventDetailHeader } from "./_components/EventDetailHeader";
import { EventDetailSchedule } from "./_components/EventDetailSchedule";

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
    notify.confirm(
      "Delete Event",
      "Are you sure you want to delete this event?",
      async () => {
        if (eventID) {
          const success = await deleteEvent(eventID);
          if (success) {
            setIsDeleting(true);
            router.replace("/(tabs)/event");
          }
        }
      },
      () => {},
      "Delete",
      "Cancel"
    );
  };

  const handleUpdateEvent = () => {
    router.push(`/event/edit?eventId=${eventID}`);
  };

  if (!event || event.id !== eventID) {
    return <LoadingScreen message="Loading event details..." />;
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-[#EEC887]"
    >
      <DetailHeader title="Detail Event" />

      <View className="flex-1 bg-white rounded-t-3xl pt-8 px-5">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Update & Delete Buttons for Creator (above card image) */}
          {isCreator && (
            <EventDetailActions
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          )}

          {/* Event Card */}
          <EventDetailHeader event={event} />

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
          <EventDetailDescription description={event.description} />

          {/* Schedule */}
          <EventDetailSchedule
            startDate={event.start_date}
            endDate={event.end_date}
          />

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
    </SafeAreaView>
  );
}
