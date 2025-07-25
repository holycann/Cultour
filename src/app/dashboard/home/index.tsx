import { Icon } from "@iconify/react";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-[#F9EFE4] px-4 pt-6">
    

      {/* Trending Event */}
      <Text className="text-lg font-bold text-[#1C1C1E] mb-3">Trending Event</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
        {[ // Dummy data
          {
            title: "Asia Afrika Festival",
            location: "Bandung, Jawa Barat",
            image: require("../../../assets/images/logoSplash.png"), // ganti sesuai file
          },
          {
            title: "Jakarta Fair",
            location: "DKI Jakarta",
            image: require("../../../assets/images/eksproler.png"),
          }
        ].map((event, index) => (
          <View
            key={index}
            className="w-64 bg-white rounded-3xl mr-4 overflow-hidden"
            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
          >
            <Image source={event.image} className="w-full h-36" resizeMode="cover" />
            <View className="p-3">
              <Text className="font-bold text-base text-[#1C1C1E] mb-1">{event.title}</Text>
              <View className="flex-row items-center">
                <Icon icon="mdi:map-marker" width={16} height={16} color="#4E7D79" />
                <Text className="text-[#4E7D79] ml-1">{event.location}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Place Recommendation */}
      <Text className="text-lg font-bold text-[#1C1C1E] mb-3">Place Recommendation</Text>
      <View className="space-y-4">
        {[ // Dummy data
          {
            name: "Bandung",
            region: "Bandung",
            image: require("../../../assets/images/warlok.png"),
          },
          {
            name: "Jakarta",
            region: "DKI Jakarta",
            image: require("../../../assets/images/warlok.png"),
          },
          {
            name: "Surabaya",
            region: "Jawa Timur",
            image: require("../../../assets/images/eksproler.png"),
          }
        ].map((place, index) => (
          <TouchableOpacity key={index} className="flex-row items-center bg-[#E4CFA0] rounded-2xl overflow-hidden shadow-sm">
            <Image source={place.image} className="w-20 h-20 rounded-l-2xl" resizeMode="cover" />
            <View className="flex-1 px-4 py-3">
              <Text className="font-bold text-base text-black">{place.name}</Text>
              <Text className="text-black">{place.region}</Text>
            </View>
            <View className="pr-4">
              <Icon icon="mdi:chevron-right" width={24} height={24} color="#4E7D79" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
