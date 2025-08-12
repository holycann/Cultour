import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DetailHeader from "@/app/_components/DetailHeader";
import { EventCard } from "@/components/EventCard";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useEvent } from "@/hooks/useEvent";

export default function EventScreen() {
  const router = useRouter();
  const { events, isLoading: loading, error, fetchEvents } = useEvent();
  const { id: cityId } = useLocalSearchParams();

  useEffect(() => {
    const fetchEventsByCity = async () => {
      if (cityId) {
        await fetchEvents({
          eventOptions: { city_id: cityId as string },
        });
      }
    };

    fetchEventsByCity();
  }, []);

  const filteredEvents = useMemo(() => {
    const id =
      typeof cityId === "string"
        ? cityId
        : Array.isArray(cityId)
          ? cityId[0]
          : "";
    if (!id) return events;

    return events.filter((event) => {
      const eventCityId = event.location?.city?.id || event.location?.city_id;
      return eventCityId === id;
    });
  }, [events, cityId]);

  const handleEventDetail = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  if (error) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1 bg-[#FFF5E1] justify-center items-center"
      >
        <Text className="text-red-500">{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-[#EEC887]"
    >
      <DetailHeader title="Event" />

      {loading ? (
        <LoadingScreen message="Loading events..." />
      ) : filteredEvents.length === 0 ? (
        <View className="flex-1 justify-center items-center bg-white rounded-t-3xl pt-8 px-6">
          <Text className="text-lg text-gray-500">No events in this city</Text>
        </View>
      ) : (
        <View className="flex-1 bg-white rounded-t-3xl pt-8 px-6">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 32,
            }}
          >
            {filteredEvents.map((event) => (
              <EventCard key={event.id} item={event} variant="place" />
            ))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}
