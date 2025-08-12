import { Badge } from "@/types/Badge";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";

const shadowStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 3,
  elevation: 2,
};

export interface BadgeSectionProps {
  title: string;
  badges: Badge[];
  emptyMessage: string;
  variant?: "earned" | "available";
}

export function BadgeSection({
  title,
  badges,
  emptyMessage,
  variant = "earned",
}: BadgeSectionProps) {
  return (
    <View style={{ marginBottom: 24, marginHorizontal: 16 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "#1E1E1E",
          marginBottom: 16,
        }}
      >
        {title}
      </Text>
      <View
        style={[
          {
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            backgroundColor: variant === "earned" ? "#F9EFE4" : "white",
          },
          shadowStyle,
        ]}
      >
        {badges.length > 0 ? (
          badges.map((badge) => (
            <View
              key={badge.id}
              style={{
                alignItems: "center",
                width: "45%",
                marginBottom: 16,
                opacity: variant === "available" ? 0.5 : 1,
              }}
            >
              <Image
                source={{ uri: badge.icon_url }}
                style={{
                  width: 128,
                  height: 128,
                }}
                placeholder={require("@/assets/images/adaptive-icon.png")}
                contentFit="contain"
                transition={300}
                priority="low"
                recyclingKey={`badge-${badge.id}`}
              />
              <Text
                style={{
                  marginTop: 8,
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#4E7D79",
                  textAlign: "center",
                }}
              >
                {badge.name}
              </Text>
            </View>
          ))
        ) : (
          <Text
            style={{
              color: "#4E7D79",
              textAlign: "center",
              width: "100%",
            }}
          >
            {emptyMessage}
          </Text>
        )}
      </View>
    </View>
  );
}
