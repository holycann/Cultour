import { LoadingScreen } from "@/components/ui/LoadingScreen";
import Colors from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { useCity } from "@/hooks/useCity";
import { City } from "@/types/City";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CityItem } from "./_components/CityItem";

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

  const loadCities = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchCities({
        pagination: {
          page: currentPage,
          per_page: 10,
        },
        listType: "default",
      });
    } catch (error) {
      console.error("Failed to fetch cities", error);
    } finally {
      setRefreshing(false);
    }
  }, [currentPage, fetchCities]);

  useEffect(() => {
    if (cities.length === 0) {
      loadCities();
    }
  }, [cities.length, loadCities]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      fetchCities({
        pagination: {
          page: currentPage - 1,
          per_page: 10,
        },
        listType: "default",
      });
    }
  }, [currentPage, fetchCities]);

  const handleNextPage = useCallback(() => {
    if (hasMoreCities) {
      fetchCities({
        pagination: {
          page: currentPage + 1,
          per_page: 10,
        },
        listType: "default",
      });
    }
  }, [currentPage, hasMoreCities, fetchCities]);

  const keyExtractor = useCallback((item: { id: string }) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({ length: 96, offset: 96 * index, index }),
    []
  );

  const renderCityItem = useCallback(({ item }: { item: City }) => (
    <CityItem city={item} />
  ), []);

  if (isLoading) {
    return <LoadingScreen message="Loading places..." />;
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

  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1 bg-white">
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
        data={cities}
        keyExtractor={keyExtractor}
        renderItem={renderCityItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadCities}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListHeaderComponent={
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
        }
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
