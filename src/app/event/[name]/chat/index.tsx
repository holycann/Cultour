import { useAuth } from "@/hooks/useAuth";
import { useMessage } from "@/hooks/useMessage";
import { useThread } from "@/hooks/useThread";
import { Icon } from "@iconify/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function ChatbotScreen() {
  const router = useRouter();
  const { name: eventName } = useLocalSearchParams<{ name: string }>();
  const { user } = useAuth();
  const { 
    aiChat, 
    askAiAboutEvent, 
    clearEventAiChat 
  } = useMessage();
  const { 
    createEventThread, 
    getThreadByEventId 
  } = useThread();

  const [query, setQuery] = useState("");
  const [isChatStarted, setIsChatStarted] = useState(false);

  // Derive event ID from event name (you might want to replace this with actual event ID lookup)
  const eventId = eventName || "default_event";

  // Start chat and create thread
  const handleStartChat = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      router.replace("/auth/login");
      return;
    }

    try {
      // Create thread for the event
      await createEventThread({ 
        event_id: eventId, 
        creator_id: user.id 
      });

      setIsChatStarted(true);
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };

  // Send AI query
  const handleSendQuery = async () => {
    if (!query.trim()) return;

    try {
      await askAiAboutEvent(eventId, query);
      setQuery("");
    } catch (error) {
      console.error("Failed to send AI query:", error);
    }
  };

  // Go back handler
  const handleGoBack = () => {
    // Clear AI chat when leaving
    clearEventAiChat(eventId);
    router.back();
  };

  // Render individual chat message
  const renderMessage = ({ item }) => (
    <View 
      className={`p-3 m-2 rounded-xl ${
        item.is_user_message 
          ? 'bg-[#4E7D79] self-end' 
          : 'bg-[#EEC887] self-start'
      }`}
    >
      <Text 
        className={`text-base ${
          item.is_user_message ? 'text-white' : 'text-[#4E7D79]'
        }`}
      >
        {item.content}
      </Text>
    </View>
  );

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
              <Text className="text-white font-bold text-lg">
                Start Chat
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-1">
            {/* Chat Messages */}
            <FlatList
              data={aiChat?.messages || []}
              renderItem={renderMessage}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
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
              />
              <TouchableOpacity 
                onPress={handleSendQuery}
                className="bg-[#4E7D79] rounded-full p-2"
              >
                <Icon 
                  icon="mdi:send" 
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