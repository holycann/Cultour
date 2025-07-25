import axios from "axios";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";

interface Place {
  id: string;
  name: string;
  province: string;
}

interface PlaceResponse {
  success: boolean;
  message: string;
  metadata: {
    pagination: {
      total: number;
      page: number;
      per_page: number;
      total_pages: number;
      has_next_page: boolean;
    }
  };
  data: Place[];
}

export default function PlaceScreen() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      // Ganti URL dengan endpoint API yang sesuai
      const response = await axios.get<PlaceResponse>('http://localhost:8181/cities/');
      setPlaces(response.data.data);
      setLoading(false);
    } catch (err) {
      console.log("Error:", err)
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  };

  function handlePress(place: Place) {
    console.log("Clicked:", place);
    // Navigasi ke detail nanti di sini
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4E7D79" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white pt-3">
      {/* Title */}
      <Text className="font-bold text-xl text-[#212121] ml-7 mb-3 mt-2">
        Place
      </Text>

      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePress(item)}
            activeOpacity={0.8}
            className="flex-row items-center mx-5 mb-5"
          >
            {/* Card Kanan */}
            <View className="flex-1 bg-[#EEC887] rounded-2xl flex-row items-center justify-between -ml-3 px-5 py-4 shadow-md">
              <View>
                <Text className="font-bold text-base text-[#222]">
                  {item.name}
                </Text>
                <Text className="text-[#222] opacity-70 text-sm">
                  {item.province}
                </Text>
              </View>
              {/* Icon panah kanan */}
              <Text className="text-2xl text-[#4E7D79] font-bold">{">"}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
