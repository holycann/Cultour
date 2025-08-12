import DetailHeader from "@/app/_components/DetailHeader";
import { useEvent } from "@/hooks/useEvent";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EventForm } from "./_components/EventForm";

export default function EditEventScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { event, getEventById, updateEvent } = useEvent();

  const [initialEventData, setInitialEventData] = useState<any>({});

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (eventId) {
        if (!event || event.id !== eventId) {
          await getEventById(eventId);
        }

        if (event) {
          // Prepare initial data for the form
          let imageUri = event.image_url;
          if (imageUri) {
            const fileUri = FileSystem.documentDirectory + event.id + ".jpg";
            const fileInfo = await FileSystem.getInfoAsync(fileUri);

            if (!fileInfo.exists) {
              const downloadedFile = await FileSystem.downloadAsync(
                imageUri,
                fileUri
              );
              imageUri = downloadedFile.uri;
            } else {
              imageUri = fileUri;
            }
          }

          setInitialEventData({
            name: event.name || "",
            description: event.description || "",
            startDate: event.start_date
              ? new Date(event.start_date)
              : new Date(),
            endDate: event.end_date ? new Date(event.end_date) : new Date(),
            province: event?.location?.city?.province_id || "",
            city: event?.location?.city_id || "",
            location: event.location
              ? {
                  latitude: event.location.latitude,
                  longitude: event.location.longitude,
                  name: event.location.name,
                }
              : {},
            image: imageUri,
          });
        }
      }
    };

    fetchEventDetails();
  }, [eventId, event]);

  const handleUpdateEvent = async (eventData: any) => {
    try {
      const updateData = {
        ...eventData,
        id: eventId,
        location_id: event?.location?.id || "",
        image_url: event?.image_url || "",
        is_kid_friendly: event?.is_kid_friendly || false,
        Location: event?.location || {
          name: "",
          latitude: 0,
          longitude: 0,
          city_id: "",
        },
      };

      const response = await updateEvent(updateData);

      if (response) {
        router.push(`/event/${eventId}`);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error updating event:", error);
      return false;
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-[#EEC887]"
    >
      <DetailHeader title="Edit Event" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          backgroundColor: "#EEC887",
          minHeight: "100%",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-t-3xl px-4 pt-6 pb-10">
          {initialEventData.name && (
            <EventForm
              initialData={initialEventData}
              onSubmit={handleUpdateEvent}
              submitButtonText="Update Event"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
