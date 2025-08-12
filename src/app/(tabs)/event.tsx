import { EventCard } from "@/components/EventCard";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import Colors from "@/constants/Colors";
import { useEvent } from "@/hooks/useEvent";
import { Event } from "@/types/Event";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EventScreen() {
  const { events, fetchEvents, isLoading, error } = useEvent();
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchEvents();
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchEvents]);

  useEffect(() => {
    if (events.length === 0) {
      loadEvents();
    }
  }, [events.length, loadEvents]);

  const handleCreateEvent = useCallback(() => {
    router.push("/event/add");
  }, [router]);

  const keyExtractor = useCallback((item: Event) => item.id, []);

  const renderEventItem = useCallback(({ item }: { item: Event }) => (
    <EventCard item={item} variant="home" />
  ), []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({ length: 312, offset: 312 * index, index }),
    []
  );

  if (isLoading) {
    return <LoadingScreen message="Loading events..." />;
  }

  if (error) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1 justify-center items-center bg-white"
      >
        <Text className="text-red-500 text-center mt-5">
          {error || "Failed to load events"}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-5 pb-3">
        <Text className="text-2xl font-bold text-[#1E1E1E]"></Text>
        <TouchableOpacity
          className="bg-[#EEC887] px-4 py-2 rounded-lg"
          onPress={handleCreateEvent}
        >
          <Text className="text-black font-semibold">+ Create Event</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        data={events}
        keyExtractor={keyExtractor}
        renderItem={renderEventItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadEvents}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        getItemLayout={getItemLayout}
        initialNumToRender={5}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews
      />
    </View>
  );
}
