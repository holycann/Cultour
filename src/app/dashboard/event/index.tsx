import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface Event {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location_id: string;
  is_kid_friendly: boolean;
  views: number;
}

export default function EventScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    console.log("🔄 Memulai fetch events...");
  
    try {
      const response = await axios.get<Event[]>('http://localhost:8181/events');
  
      console.log("✅ Response Status:", response.status);
      console.log("✅ Response Data:", response.data);
  
      setEvents(response.data);
      setLoading(false);
    } catch (err: any) {
      console.log("❌ Terjadi error saat fetch events");
  
      if (axios.isAxiosError(err)) {
        console.error("🔴 Axios error:", err.message);
        console.error("🔴 Response error:", err.response?.data);
      } else {
        console.error("🔴 Unknown error:", err);
      }
  
      setError(err.message || "Terjadi kesalahan");
      setLoading(false);
    }
  };
  
  const handleCreateEvent = () => {
    router.push('/dashboard/addEvan');
  };

  const handleEventDetail = (eventId: string) => {
    router.push(`/dashboard/event/${eventId}`);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#F9EFE4] justify-center items-center">
        <ActivityIndicator size="large" color="#4E7D79" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#F9EFE4] justify-center items-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F9EFE4]">
      <View className="flex-row justify-between items-center p-4">
        <Text className="text-xl font-bold text-[#4E7D79]">Event</Text> 
        <Pressable 
          onPress={handleCreateEvent}
          className="bg-[#EEC887] px-4 py-2 rounded-lg"
        >
          <Text className="text-[#4E7D79] font-bold">Create Event</Text>
        </Pressable>
      </View>

      <ScrollView 
        contentContainerStyle={{ 
          paddingHorizontal: 16, 
          paddingBottom: 20 
        }}
      >
        {events.map((event) => (
          <TouchableOpacity 
            key={event.id}
            onPress={() => handleEventDetail(event.id)}
            className="mb-4 bg-white rounded-xl shadow-md"
          >
            <View className="p-4">
              <Text className="text-lg font-bold text-[#4E7D79]">
                {event.name}
              </Text>
              <Text className="text-sm text-gray-600 mt-2">
                {event.description}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                Tanggal: {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
              </Text>
              <TouchableOpacity 
                className="mt-2"
                onPress={() => handleEventDetail(event.id)}
              >
                <Text className="text-[#EEC887] font-bold">
                  Lihat Detail
                </Text>
              </TouchableOpacity> 
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
