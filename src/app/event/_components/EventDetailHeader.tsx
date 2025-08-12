import { Event } from "@/types/Event";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";

export interface EventDetailHeaderProps {
  event: Event;
}

export function EventDetailHeader({ event }: EventDetailHeaderProps) {
  return (
    <View style={{ 
      alignItems: 'center', 
      marginBottom: 24 
    }}>
      <View style={{
        width: '90%',
        borderRadius: 24,
        backgroundColor: '#F3DDBF',
        padding: 16
      }}>
        {/* Image */}
        <Image
          source={{
            uri: event.image_url || "https://placehold.co/350x200",
          }}
          style={{
            width: '100%',
            height: 192,
            borderRadius: 16,
            marginBottom: 16
          }}
          placeholder={require("@/assets/images/adaptive-icon.png")}
          contentFit="cover"
          transition={300}
          priority="high"
          recyclingKey={`event-detail-${event.id}`}
        />

        {/* Text */}
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '600', 
          color: '#1E1E1E', 
          marginBottom: 4 
        }}>
          {event.name}
        </Text>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'flex-start' 
        }}>
          <Text style={{ 
            fontSize: 14, 
            color: '#666', 
            marginRight: 8 
          }}>
            📍
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: '#666', 
            flex: 1 
          }}>
            {event.location?.name || "Location not specified"}
          </Text>
        </View>
      </View>
    </View>
  );
}
