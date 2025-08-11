import { Typography } from "@/constants/Typography";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function OAuthCallback() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tabs)/profile");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <View className="flex-1 justify-center items-center bg-[#F8F5ED] p-5">
      <View className="items-center">
        <ActivityIndicator size="large" color="#10B981" className="mb-5" />
        <Text
          className="text-[#333] mb-3 text-center"
          style={Typography.styles.title}
        >
          Authentication Successful
        </Text>
        <Text
          className="text-[#666] mb-5 text-center"
          style={Typography.styles.body}
        >
          Redirecting...
        </Text>
      </View>
    </View>
  );
}
