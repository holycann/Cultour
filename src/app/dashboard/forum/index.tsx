import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function CommunityScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Pressable
        className="bg-blue-700 rounded-2xl px-10 py-5 shadow-xl active:opacity-80"
        onPress={() => router.push("/auth/register")}
      >
        <Text className="text-white font-bold text-lg">Join Community</Text>
      </Pressable>
    </View>
  );
}
