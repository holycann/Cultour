import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState({
    id: id,
    title: "Festival Budaya Nusantara",
    description: "Sebuah acara spektakuler yang menampilkan keragaman budaya Indonesia dari berbagai daerah. Nikmati pertunjukan seni, tarian tradisional, dan pameran kerajinan.",
    location: "Jakarta Convention Center",
    images: ['https://via.placeholder.com/350x200?text=Festival+Budaya+Nusantara'],
    startDate: new Date('2024-03-15T09:00:00'),
    endDate: new Date('2024-03-17T18:00:00')
  });

  const handleGoBack = () => {
    router.back();
  };

  const handleAskAI = () => {
    Alert.alert("AI Konsultasi", "Fitur konsultasi AI akan segera hadir.");
  };

  const handleDiscussion = () => {
    Alert.alert("Diskusi", "Fitur diskusi akan segera hadir.");
  };

  return (
    <View className="flex-1 bg-[#F9EFE4]">
      {/* Header dengan tombol kembali */}
      <View className="flex-row items-center p-4">
        <TouchableOpacity onPress={handleGoBack} className="mr-4">
          <Text className="text-[#4E7D79] text-lg">{"<"}</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#4E7D79]">Detail Event</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ 
          paddingBottom: 20 
        }}
      >
        {/* Gambar Event */}
        <View className="bg-white rounded-2xl m-4">
          <Image 
            source={{ uri: event.images[0] || 'https://via.placeholder.com/350x200' }}
            className="w-full h-48 rounded-t-2xl"
            resizeMode="cover"
          />
          <View className="p-4">
            <Text className="text-lg font-bold text-[#4E7D79]">
              {event.title}
            </Text>
            <View className="flex-row items-center mt-2">
              <Text className="text-[#EEC887] mr-2">📍</Text>
              <Text className="text-[#4E7D79]">{event.location}</Text>
            </View>
          </View>
        </View>

        {/* Deskripsi */}
        <View className="px-4">
          <Text className="text-xl font-bold text-[#4E7D79] mb-2">Description</Text>
          <Text className="text-[#4E7D79]">
            {event.description}
          </Text>
        </View>

        {/* Jadwal */}
        <View className="px-4 mt-4">
          <Text className="text-xl font-bold text-[#4E7D79] mb-2">Schedule</Text>
          <View className="flex-row items-center mb-2">
            <Text className="text-[#EEC887] font-bold mr-2">Start Date & Time:</Text>
            <Text className="text-[#4E7D79]">
              {new Date(event.startDate).toLocaleString()}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-[#EEC887] font-bold mr-2">End Date & Time:</Text>
            <Text className="text-[#4E7D79]">
              {new Date(event.endDate).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Tombol Aksi */}
        <View className="flex-row justify-between px-4 mt-6">
            <TouchableOpacity 
                onPress={() => router.push('/chat')}
                className="bg-[#EEC887] rounded-xl py-3 px-6 items-center flex-1 mr-2"
            >
                <Text className="text-[#4E7D79] font-bold">Ask AI</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                onPress={() => router.push('/discusion')}
                className="bg-[#EEC887] rounded-xl py-3 px-6 items-center flex-1 ml-2"
            >
                <Text className="text-[#4E7D79] font-bold">Discussion</Text>
            </TouchableOpacity>
            </View>
      </ScrollView>
    </View>
  );
}
