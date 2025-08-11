import Colors from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/hooks/useAuth";
import { useCity } from "@/hooks/useCity";
import { useEvent } from "@/hooks/useEvent";
import { useUser } from "@/hooks/useUser";
import { City } from "@/types/City";
import { Event } from "@/types/Event";
import { logger } from "@/utils/logger";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();

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

  // Fetch data on component mount
  const loadData = async () => {
    try {
      setRefreshing(true);
      if (user) {
        await fetchUserProfile(user.id);
      }
      await fetchEvents();
      await fetchTrendingEvents();
      await fetchCities({
        pagination: { per_page: 5 },
        listType: "home",
      });
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
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1 justify-center items-center bg-white"
      >
        <View className="flex-col items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="mt-4 text-base text-gray-600">
            Loading events...
          </Text>
        </View>
      </SafeAreaView>
    );
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
          keyExtractor={(item: Event) => item.id || ""}
          contentContainerStyle={{ gap: 16 }}
          renderItem={({ item }: { item: Event }) => {
            return (
              <TouchableOpacity
                className="w-72 bg-[#F3DDBF] rounded-2xl p-3"
                onPress={() => {
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
                  📍 {item.location?.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Section: Place Recommendation */}
      <View className="px-6 mt-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text style={Typography.styles.title}>Place Recommendation</Text>
        </View>

        {homePageCities.map((city: City) => {
          return (
            <View key={city.id} className="flex-row items-center mb-4">
              <Image
                source={
                  city.image_url && city.image_url.startsWith("http")
                    ? { uri: city.image_url }
                    : require("@/assets/images/logo.png")
                }
                className="w-[80px] h-[80px] rounded-xl mr-3"
                width={80}
                height={80}
                resizeMode="cover"
                defaultSource={require("@/assets/images/logo.png")}
              />

              <TouchableOpacity
                className="flex-1 flex-row items-center rounded-2xl py-4 px-5 min-h-[80px]"
                style={{
                  backgroundColor: Colors.primary50,
                }}
                onPress={() => {
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
                    {city.province?.name}
                  </Text>
                </View>
                <Text className="text-2xl text-[#1A1A1A] font-bold opacity-50 ml-3">
                  <MaterialIcons
                    name="arrow-forward-ios"
                    size={20}
                    color="#1A1A1A"
                  />
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
