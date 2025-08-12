import { EventCard } from "@/components/EventCard";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import Colors from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/hooks/useAuth";
import { useCity } from "@/hooks/useCity";
import { useEvent } from "@/hooks/useEvent";
import { useUser } from "@/hooks/useUser";
import { Event } from "@/types/Event";
import { logger } from "@/utils/logger";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CityRecommendationCard } from "./_components/CityRecommendationCard";

export default function HomeScreen() {
  const { user } = useAuth();

  const {
    trendingEvents,
    isLoading: eventsLoading,
    fetchEvents,
    fetchTrendingEvents,
  } = useEvent();

  const { fetchUserProfile } = useUser();

  const { homePageCities, fetchCities, isLoading: citiesLoading } = useCity();

  const [refreshing, setRefreshing] = useState(false);

  // Render trending event item
  const renderTrendingEventItem = useCallback(({ item }: { item: Event }) => (
    <EventCard item={item} variant="trending" />
  ), []);

  // Fetch data on component mount
  const loadData = async () => {
    try {
      setRefreshing(true);
      // Parallelize independent network requests
      await Promise.all([
        user ? fetchUserProfile(user.id) : Promise.resolve(),
        fetchEvents(),
        fetchTrendingEvents(),
        fetchCities({
          pagination: { per_page: 5 },
          listType: "home",
        }),
      ]);
    } catch (error) {
      logger.error("HomeScreen", "Data Fetch Error", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Loading state
  if (eventsLoading || citiesLoading) {
    return <LoadingScreen message="Loading events..." />;
  }

  // Add null checks to prevent undefined errors
  if (
    !trendingEvents ||
    trendingEvents.length === 0 ||
    !homePageCities ||
    homePageCities.length === 0
  ) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1 justify-center items-center bg-white"
      >
        <Text>No data available</Text>
        <Text>Trending Events: {trendingEvents?.length}</Text>
        <Text>Cities: {homePageCities?.length}</Text>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 20 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={loadData}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
    >
      {/* Section: Trending Events */}
      <View className="px-6">
        <Text className="text-[#1A1A1A] mb-4" style={Typography.styles.title}>
          Trending Events
        </Text>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={trendingEvents}
          keyExtractor={(item) => item.id || ""}
          contentContainerStyle={{ gap: 16 }}
          renderItem={renderTrendingEventItem}
        />
      </View>

      {/* Section: Place Recommendation */}
      <View className="px-6 mt-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text style={Typography.styles.title}>Place Recommendation</Text>
        </View>

        {homePageCities.map((city) => (
          <CityRecommendationCard key={city.id} city={city} />
        ))}
      </View>
    </ScrollView>
  );
}
