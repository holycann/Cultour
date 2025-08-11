import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
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
  const { id: cityId } = useLocalSearchParams();

  useEffect(() => {
    const fetchEventsByCity = async () => {
      if (cityId) {
        await fetchEvents({ city_id: cityId as string });
      }
    };

    fetchEventsByCity();
  }, []);

  const filteredEvents = useMemo(() => {
    const id = typeof cityId === "string" ? cityId : Array.isArray(cityId) ? cityId[0] : "";
    if (!id) return events;

    return events.filter((event) => {
      const eventCityId = event.city_id || event.location?.city_id;
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
        <View className="flex-1 justify-center items-center bg-white rounded-t-3xl pt-8 px-6">
          <ActivityIndicator size="large" color="#4E7D79" />
        </View>
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
              <TouchableOpacity
                key={event.id}
                onPress={() => handleEventDetail(event.id)}
                className="items-center mb-6"
              >
                <View className="w-full rounded-3xl bg-[#F3DDBF] p-4">
                  {/* Gambar */}
                  <Image
                    source={{
                      uri:
                        event.image_url ||
                        "https://via.placeholder.com/350x200",
                    }}
                    className="w-full h-48 rounded-2xl mb-4"
                    resizeMode="cover"
                  />

                  {/* Text */}
                  <Text className="text-lg font-bold text-[#1E1E1E] mb-1">
                    {event.name}
                  </Text>
                  <Text className="text-sm text-gray-600 mb-2">
                    {event.description && event.description.length > 150
                      ? event.description.slice(0, 150) + "..."
                      : event.description}
                  </Text>

                  {/* Action */}
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      onPress={() => handleEventDetail(event.id)}
                      className="flex-row items-center"
                    >
                      <View className="bg-[#EEC887] px-4 py-1 rounded-full mr-2">
                        <Text className="text-[#1E1E1E] font-bold text-sm">
                          See Detail
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#EEC887"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}
