import { useAi } from "@/hooks/useAi";
import { useAuth } from "@/hooks/useAuth";
import { AiMessage } from "@/types/Ai";
import { Icon } from "@iconify/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatbotScreen() {
  const router = useRouter();
  const { id: eventId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const {
    messages,
    createChatSession,
    sendChatMessage,
    currentSessionId,
    isLoading,
    clearConversation,
  } = useAi();

  const [query, setQuery] = useState("");
  const [isChatStarted, setIsChatStarted] = useState(false);

  // Start chat and create session
  const handleStartChat = useCallback(async () => {
    if (!user) {
      // Redirect to login if not authenticated
      router.replace("/auth/login");
      return;
    }

    try {
      // Create AI chat session
      await createChatSession({
        event_id: eventId,
        user_id: user.id,
      });

      if (currentSessionId !== "" && !isLoading && !clearConversation) {
        setIsChatStarted(true);
      }

    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  }, [user, eventId, createChatSession, router]);

  // Send AI query
  const handleSendQuery = useCallback(async () => {
    if (!query.trim() || !currentSessionId) return;

    try {
      await sendChatMessage({ message: query });
      setQuery("");
    } catch (error) {
      console.error("Failed to send AI query:", error);
    }
  }, [query, currentSessionId, sendChatMessage]);

  // Go back handler
  const handleGoBack = useCallback(() => {
    // Clear conversation when leaving
    clearConversation();
    router.back();
  }, [clearConversation, router]);

  // Render individual chat message
  const renderMessage: ListRenderItem<AiMessage> = ({ item }) => (
    <View
      className={`p-3 m-2 rounded-xl ${
        item.role === "user"
          ? "bg-[#4E7D79] self-end"
          : "bg-[#EEC887] self-start"
      }`}
    >
      <Text
        className={`text-base ${
          item.role === "user" ? "text-white" : "text-[#4E7D79]"
        }`}
      >
        {item.content}
      </Text>
    </View>
  );

  // Auto-start chat if user is logged in
  useEffect(() => {
    if (user) {
      handleStartChat();
    }
  }, [user, handleStartChat]);

  return (
    <SafeAreaView className="flex-1 bg-[#EEC887]">
      {/* Header */}
      <View className="flex-row items-center p-4">
        <TouchableOpacity onPress={handleGoBack} className="mr-4">
          <Text className="text-[#4E7D79] text-lg">{"<"}</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#4E7D79]">AI Chatbot</Text>
      </View>

      {/* Konten Utama */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {!isChatStarted ? (
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-2xl font-bold text-[#4E7D79] mb-4 text-center">
              Cultour
            </Text>
            <Text className="text-base text-[#4E7D79] mb-8 text-center">
              Smart Guide to Cultural Discovery
            </Text>

            <TouchableOpacity
              onPress={handleStartChat}
              className="bg-[#4E7D79] rounded-xl py-4 px-8 w-full items-center"
            >
              <Text className="text-white font-bold text-lg">Start Chat</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-1">
            {/* Chat Messages */}
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "flex-end",
              }}
              inverted
            />

            {/* Input Area */}
            <View className="flex-row items-center p-4 bg-white">
              <TextInput
                placeholder="Ask about the event..."
                placeholderTextColor="#4E7D79"
                value={query}
                onChangeText={setQuery}
                className="flex-1 bg-[#F0F0F0] rounded-xl px-4 py-2 mr-2 text-[#4E7D79]"
                multiline
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={handleSendQuery}
                className="bg-[#4E7D79] rounded-full p-2"
                disabled={isLoading || !query.trim()}
              >
                <Icon
                  icon={isLoading ? "mdi:loading" : "mdi:send"}
                  width={24}
                  height={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
