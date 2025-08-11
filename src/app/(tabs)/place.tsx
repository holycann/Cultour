import Colors from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { useCity } from "@/hooks/useCity";
import { City } from "@/types/City";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlaceList() {
  const {
    cities,
    fetchCities,
    isLoading,
    error,
    currentPage,
    hasMoreCities,
    totalPages,
  } = useCity();

  const [refreshing, setRefreshing] = useState(false);

  const loadCities = async () => {
    try {
      setRefreshing(true);
      await fetchCities({
        pagination: { 
          page: currentPage, 
          per_page: 10 
        },
        listType: "default"
      });
    } catch (error) {
      console.error("Failed to fetch cities", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Fetch locations if not already loaded
    if (cities.length === 0) {
      loadCities();
    }
  }, [cities, fetchCities]);

  if (isLoading) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1 justify-center items-center bg-white"
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1 justify-center items-center bg-white"
      >
        <Text className="text-red-500">{error || "Failed to load places"}</Text>
      </SafeAreaView>
    );
  }

  // Pagination handlers for cities
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchCities({
        pagination: { 
          page: currentPage - 1, 
          per_page: 10 
        },
        listType: "default"
      });
    }
  };

  const handleNextPage = () => {
    if (hasMoreCities) {
      fetchCities({
        pagination: { 
          page: currentPage + 1, 
          per_page: 10 
        },
        listType: "default"
      });
    }
  };

  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1 bg-white">
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadCities}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[#1A1A1A]" style={Typography.styles.title}>
            Places
          </Text>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              className={`bg-[#F3DDBF] rounded-full p-2 items-center justify-center ${
                currentPage <= 1 ? "opacity-50" : ""
              }`}
              onPress={handlePreviousPage}
              disabled={currentPage <= 1}
            >
              <Ionicons name="arrow-back" size={16} color={Colors.black} />
            </TouchableOpacity>
            <Text className="text-[#1A1A1A]">
              {currentPage} - {totalPages}
            </Text>
            <TouchableOpacity
              className={`bg-[#F3DDBF] rounded-full p-2 items-center justify-center ${
                !hasMoreCities ? "opacity-50" : ""
              }`}
              onPress={handleNextPage}
              disabled={!hasMoreCities}
            >
              <Ionicons name="arrow-forward" size={16} color={Colors.black} />
            </TouchableOpacity>
          </View>
        </View>

        {cities.map((city: City) => (
          <TouchableOpacity
            key={city.id}
            className="flex-row items-center mb-6"
            onPress={() => router.push(`/place/${city.id}`)}
          >
            <Image
              source={{ uri: city.image_url || "" }}
              className="w-[80px] h-[80px] rounded-xl mr-3"
              width={80}
              height={80}
              resizeMode="cover"
            />

            <View
              className="flex-1 flex-row items-center rounded-2xl py-4 px-5 min-h-[80px]"
              style={{
                backgroundColor: Colors.primary50,
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
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
