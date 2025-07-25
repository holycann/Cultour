import { useRouter } from "expo-router";
import React from "react";
import {
    Image,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from "react-native";

// Definisi tipe badge
interface Badge {
  id: string;
  name: string;
  icon: any;
}

// Daftar badge statis (nanti bisa diganti dengan data dari backend)
const BADGES: Badge[] = [
  {
    id: 'explorer',
    name: 'Explorer',
    icon: require('../../../../assets/images/eksproler.png') // Buat asset ini nanti
  },
  {
    id: 'warlok',
    name: 'Warlok',
    icon: require('../../../../assets/images/warlok.png') // Buat asset ini nanti
  }
];

export default function BadgeScreen() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View 
      className="flex-1" 
      style={{ backgroundColor: '#F9EFE4' }}
    >
      <StatusBar 
        backgroundColor="#F9EFE4" 
        barStyle="dark-content" 
      />

      {/* Header */}
      <View className="flex-row items-center p-4">
        <TouchableOpacity onPress={handleGoBack} className="mr-4">
          <Text className="text-[#4E7D79] text-lg">{"<"}</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#4E7D79]">Badge</Text>
      </View>

      {/* Konten Badge */}
      <View className="px-4 mt-4">
        <Text className="text-2xl font-bold text-[#4E7D79] mb-4">Badge</Text>
        
        <View 
          className="bg-white rounded-xl p-4"
          style={{ 
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <View className="flex-row justify-between">
            {BADGES.map((badge) => (
              <View 
                key={badge.id} 
                className="items-center w-[45%]"
              >
                <Image 
                  source={badge.icon} 
                  className="w-32 h-32" 
                  resizeMode="contain" 
                />
                <Text 
                  className="mt-2 text-base font-bold text-[#4E7D79]"
                >
                  {badge.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
