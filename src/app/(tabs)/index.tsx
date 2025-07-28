import Colors from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { useCity } from "@/hooks/useCity";
import { useEvent } from "@/hooks/useEvent";
import { City } from "@/types/City";
import { Event } from "@/types/Event";
import { logger } from "@/utils/logger";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const {
    trendingEvents,
    isLoading: eventsLoading,
    fetchTrendingEvents,
    error: eventsError,
  } = useEvent();
  const {
    cities,
    isLoading: citiesLoading,
    fetchCities,
    error: citiesError,
  } = useCity();

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      logger.log("HomeScreen", "Fetching Initial Data");

      try {
        await fetchTrendingEvents();
        await fetchCities();

        logger.log("HomeScreen", "Data Fetch Completed", {
          eventCount: trendingEvents.length,
          cityCount: cities.length,
        });
      } catch (error) {
        logger.error("HomeScreen", "Data Fetch Error", error);
      }
    };

    if (trendingEvents.length === 0 || cities.length === 0) {
      loadData();
    }
  }, [fetchTrendingEvents, fetchCities, trendingEvents.length, cities.length]);

  // Log any errors
  useEffect(() => {
    if (eventsError) {
      logger.error("HomeScreen", "Events Error", eventsError);
    }
    if (citiesError) {
      logger.error("HomeScreen", "Cities Error", citiesError);
    }
  }, [eventsError, citiesError]);

  // Helper function to get location by ID
  const getCityById = (cityId: string) => {
    const city = cities.find((city: City) => city.id === cityId);

    logger.log("HomeScreen", "Get City By ID", {
      cityId,
      cityFound: !!city,
    });

    return city;
  };

  // Loading state
  if (eventsLoading || citiesLoading) {
    logger.log("HomeScreen", "Loading State Active");
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Add null checks to prevent undefined errors
  if (!trendingEvents || !cities) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>No data available</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      {/* Section: Trending Events */}
      <View className="px-6 mt-6">
        <Text className="text-[#1A1A1A] mb-4" style={Typography.styles.title}>
          Trending Events
        </Text>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={trendingEvents}
          keyExtractor={(item: Event) => item.id || ""}
          contentContainerStyle={{ gap: 16 }}
          renderItem={({ item }: { item: Event }) => {
            const city = getCityById(item.city_id || "");
            return (
              <TouchableOpacity
                className="w-72 bg-[#F3DDBF] rounded-2xl p-3"
                onPress={() => {
                  logger.log("HomeScreen", "Event Pressed", {
                    eventId: item.id,
                  });
                  router.push(`/event/${item.id}` as any);
                }}
              >
                <Image
                  source={{ uri: item.image_url || "" }}
                  className="w-full h-40 rounded-xl mb-3"
                  resizeMode="cover"
                />
                <Text
                  className="text-[#1A1A1A] mb-1"
                  style={Typography.styles.subtitle}
                >
                  {item.name}
                </Text>
                <Text className="text-sm text-[#1A1A1A] opacity-70">
                  📍 {city?.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Section: Place Recommendation */}
      <View className="px-6 mt-10">
        <Text className="text-[#1A1A1A] mb-4" style={Typography.styles.title}>
          Place Recommendation
        </Text>

        {cities.map((city: City) => (
          <View key={city.id} className="flex-row items-center mb-4">
            <Image
              source={{ uri: (city as any).image_url || "" }}
              className="w-[72px] h-[72px] rounded-xl mr-3 border"
              style={{
                backgroundColor: Colors.primary50,
                borderColor: Colors.primary,
              }}
              resizeMode="cover"
            />

            <TouchableOpacity
              className="flex-1 flex-row items-center rounded-2xl py-4 px-5 shadow-sm min-h-[72px]"
              style={{
                backgroundColor: Colors.primary50,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              }}
              onPress={() => {
                logger.log("HomeScreen", "City Pressed", { cityId: city.id });
                router.push(`/place/${city.id}` as any);
              }}
            >
              <View className="flex-1">
                <Text
                  className="text-[#1A1A1A]"
                  style={Typography.styles.subtitle}
                >
                  {city.name}
                </Text>
                <Text
                  className="text-[#1A1A1A] opacity-70"
                  style={Typography.styles.body}
                >
                  {city.Province?.name}
                </Text>
              </View>
              <Text className="text-2xl text-[#1A1A1A] font-bold opacity-50 ml-3">
                {">"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
