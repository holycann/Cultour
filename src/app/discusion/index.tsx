import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function DiscusionScreen() {
  const router = useRouter();
  const [isChatStarted, setIsChatStarted] = useState(false);

  const handleStartChat = () => {
    setIsChatStarted(true);
    // TODO: Implementasi logika memulai chat dengan AI
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#EEC887]">
      {/* Header */}
      <View className="flex-row items-center p-4">
        <TouchableOpacity onPress={handleGoBack} className="mr-4">
          <Text className="text-[#4E7D79] text-lg">{"<"}</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#4E7D79]">Chatbot</Text>
      </View>

      {/* Konten Utama */}
      <View className="flex-1 justify-center items-center px-6">
        {!isChatStarted ? (
          <View className="items-center">
            <Text className="text-2xl font-bold text-[#4E7D79] mb-4 text-center">
              Cultour
            </Text>
            <Text className="text-base text-[#4E    7D79] mb-8 text-center">
              Smart Guide to Cultural Discovery
            </Text>

            <TouchableOpacity 
              onPress={handleStartChat}
              className="bg-[#4E7D79] rounded-xl py-4 px-8 w-full items-center"
            >
              <Text className="text-white font-bold text-lg">
                Start Chat
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-1 w-full">
            {/* TODO: Implementasi antarmuka chat */}
            <Text className="text-center text-[#4E7D79]">
              Chat dimulai...
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
