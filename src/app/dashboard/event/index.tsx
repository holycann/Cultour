import { useRouter } from "expo-router";
import React, { useState } from "react";

import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// Gunakan data dummy untuk event
const dummyEvents = [
  {
    id: '1',
    title: 'Festival Budaya Nusantara',
    images: ['https://via.placeholder.com/350x200?text=Festival+Budaya+Nusantara'],
    description: 'Sebuah acara spektakuler yang menampilkan keragaman budaya Indonesia'
  },
  {
    id: '2', 
    title: 'Pameran Seni Tradisional',
    images: ['https://via.placeholder.com/350x200?text=Pameran+Seni+Tradisional'],
    description: 'Pameran karya seni dari berbagai daerah di Indonesia'
  }
];

export default function EventScreen() {
  const router = useRouter();
  const [events] = useState(dummyEvents);

  const handleCreateEvent = () => {
    router.push('/dashboard/addEvan');
  };

  const handleEventDetail = (eventId: string) => {
    router.push(`/dashboard/event/${eventId}`);
  };

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
            <Image 
              source={{ uri: event.images[0] || 'https://via.placeholder.com/350x200' }}
              className="w-full h-48 rounded-t-xl"
              resizeMode="cover"
            />
            <View className="p-4">
              <Text className="text-lg font-bold text-[#4E7D79]">
                {event.title}
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
