import DetailHeader from "@/app/_components/DetailHeader";
import { useEvent } from "@/hooks/useEvent";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EventForm } from "./_components/EventForm";

export default function AddEventScreen() {
  const router = useRouter();
  const { createEvent } = useEvent();

  const handleCreateEvent = async (eventData: any) => {
    try {
      const response = await createEvent(eventData);

      if (response) {
        router.push("/event");
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error creating event:", error);
      return false;
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-[#EEC887]"
    >
      <DetailHeader title="Create Event" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          backgroundColor: "#EEC887",
          minHeight: "100%",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-t-3xl px-4 pt-6 pb-10">
          <EventForm
            onSubmit={handleCreateEvent}
            submitButtonText="Create Event"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
