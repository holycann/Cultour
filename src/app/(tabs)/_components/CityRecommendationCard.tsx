import Colors from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { City } from "@/types/City";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export interface CityRecommendationCardProps {
  city: City;
}

export function CityRecommendationCard({ city }: CityRecommendationCardProps) {
  const router = useRouter();

  return (
    <View style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginBottom: 16 
    }}>
      <Image
        source={
          city.image_url && city.image_url.startsWith("http")
            ? { uri: city.image_url }
            : require("@/assets/images/logo.png")
        }
        style={{
          width: 80,
          height: 80,
          borderRadius: 12,
          marginRight: 12,
        }}
        placeholder={require("@/assets/images/adaptive-icon.png")}
        contentFit="cover"
        transition={300}
        priority="low"
        recyclingKey={`city-recommendation-${city.id}`}
      />

      <TouchableOpacity
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 16,
          paddingVertical: 16,
          paddingHorizontal: 20,
          minHeight: 80,
          backgroundColor: Colors.primary50,
        }}
        onPress={() => {
          router.push(`/place/${city.id}` as any);
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={[{ color: '#1A1A1A' }, Typography.styles.subtitle]}>
            {city.name}
          </Text>
          <Text 
            style={[
              { color: '#1A1A1A', opacity: 0.7 }, 
              Typography.styles.body
            ]}
          >
            {city.province?.name}
          </Text>
        </View>
        <Text style={{ 
          fontSize: 20, 
          color: '#1A1A1A', 
          fontWeight: 'bold', 
          opacity: 0.5, 
          marginLeft: 12 
        }}>
          <MaterialIcons name="arrow-forward-ios" size={20} color="#1A1A1A" />
        </Text>
      </TouchableOpacity>
    </View>
  );
}
