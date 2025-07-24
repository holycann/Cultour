import { Icon } from "@iconify/react";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-blue-900 justify-center items-center">
      <Pressable
        style={{ backgroundColor: "#F9EFE4" }}
        className="rounded-3xl px-10 py-8 shadow-xl active:opacity-80 flex items-center justify-center"
        accessibilityLabel="Go to Login"
        onPress={() => router.push("/dashboard/home")}
      >
        <Icon icon="mdi:login" width={36} height={36} color="#1e293b" />
        <Text className="mt-2 font-bold text-base text-slate-800">
          Go to Login
        </Text>
      </Pressable>
    </View>
  );
}
