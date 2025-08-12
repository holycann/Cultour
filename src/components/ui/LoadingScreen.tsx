import Colors from "@/constants/Colors";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LoadingScreenProps {
  message?: string;
  backgroundColor?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
  backgroundColor = "white",
}) => {
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className={`flex-1 justify-center items-center bg-${backgroundColor}`}
    >
      <View className="flex-col items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text className="mt-4 text-base text-gray-600">{message}</Text>
      </View>
    </SafeAreaView>
  );
};
