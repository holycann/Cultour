import { Typography } from "@/constants/Typography";
import { Event } from "@/types/Event";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface EventCardProps {
  item: Event;
  variant?: "home" | "place" | "trending";
}

export function EventCardComponent({ item, variant = "home" }: EventCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/event/${item.id}`);
  };

  if (variant === "trending") {
    return (
      <TouchableOpacity
        style={{
          width: 288,
          backgroundColor: "#F3DDBF",
          borderRadius: 16,
          padding: 12
        }}
        onPress={handlePress}
      >
        <Image
          source={{ uri: item.image_url || "" }}
          style={{
            width: "100%",
            height: 160,
            borderRadius: 12,
            marginBottom: 12
          }}
          placeholder={require("@/assets/images/adaptive-icon.png")}
          contentFit="cover"
          transition={300}
          priority="low"
          recyclingKey={`trending-event-${item.id}`}
        />
        <Text
          style={[
            { color: "#1A1A1A", marginBottom: 4 }, 
            Typography.styles.subtitle
          ]}
        >
          {item.name}
        </Text>
        <Text style={{ 
          fontSize: 14, 
          color: "#1A1A1A", 
          opacity: 0.7 
        }}>
          📍 {item.location?.name}
        </Text>
      </TouchableOpacity>
    );
  }

  if (variant === "home") {
    return (
      <View
        style={[
          {
            backgroundColor: "#F3DDBF",
            borderRadius: 16,
            marginBottom: 20,
            paddingHorizontal: 24,
            paddingTop: 24
          },
          styles.cardShadow
        ]}
      >
        <Image
          source={{ uri: item.image_url || "" }}
          style={{
            width: "100%",
            height: 208,
            borderRadius: 24
          }}
          placeholder={require("@/assets/images/adaptive-icon.png")}
          contentFit="cover"
          transition={300}
          priority="low"
          recyclingKey={`home-event-${item.id}`}
        />
        <View style={{ padding: 16 }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: "bold", 
            color: "#1E1E1E", 
            marginBottom: 16 
          }}>
            {item.name}
          </Text>

          <TouchableOpacity
            onPress={handlePress}
            style={{
              backgroundColor: "#EEC887",
              paddingHorizontal: 24,
              paddingVertical: 8,
              borderRadius: 64,
              alignSelf: "flex-start"
            }}
          >
            <View style={{ 
              backgroundColor: "#EEC887", 
              borderRadius: 64 
            }}>
              <Text style={{ 
                color: "#1E1E1E", 
                fontWeight: "600", 
                fontSize: 14 
              }}>
                See Detail
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Place variant
  return (
    <TouchableOpacity
      key={item.id}
      onPress={handlePress}
      style={{ 
        alignItems: "center", 
        marginBottom: 24 
      }}
    >
      <View
        style={{
          width: "100%",
          borderRadius: 24,
          backgroundColor: "#F3DDBF",
          padding: 16
        }}
      >
        {/* Image */}
        <Image
          source={{
            uri: item.image_url || "https://via.placeholder.com/350x200",
          }}
          style={{
            width: "100%",
            height: 192,
            borderRadius: 16,
            marginBottom: 16
          }}
          placeholder={require("@/assets/images/adaptive-icon.png")}
          contentFit="cover"
          transition={300}
          priority="low"
          recyclingKey={`place-event-${item.id}`}
        />

        {/* Text */}
        <Text style={{ 
          fontSize: 18, 
          fontWeight: "bold", 
          color: "#1E1E1E", 
          marginBottom: 4 
        }}>
          {item.name}
        </Text>
        <Text style={{ 
          fontSize: 14, 
          color: "gray", 
          marginBottom: 8 
        }}>
          {item.description && item.description.length > 150
            ? item.description.slice(0, 150) + "..."
            : item.description}
        </Text>

        {/* Action */}
        <View style={{ 
          flexDirection: "row", 
          alignItems: "center" 
        }}>
          <TouchableOpacity
            onPress={handlePress}
            style={{ 
              flexDirection: "row", 
              alignItems: "center" 
            }}
          >
            <View style={{
              backgroundColor: "#EEC887",
              paddingHorizontal: 16,
              paddingVertical: 4,
              borderRadius: 64,
              marginRight: 8
            }}>
              <Text style={{ 
                color: "#1E1E1E", 
                fontWeight: "bold", 
                fontSize: 14 
              }}>
                See Detail
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#EEC887" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

EventCardComponent.displayName = "EventCard";
export const EventCard = React.memo(EventCardComponent);

const styles = StyleSheet.create({
  cardShadow: {
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
});
