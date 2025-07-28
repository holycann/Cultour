import DetailHeader from "@/app/components/DetailHeader";
import { useAi } from "@/hooks/useAi";
import { useAuth } from "@/hooks/useAuth";
import { AiMessage } from "@/types/Ai";
import { Ionicons } from "@expo/vector-icons";
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

  const handleStartChat = useCallback(async () => {
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    try {
      await createChatSession({ event_id: eventId, user_id: user.id });
      // Jangan cek currentSessionId di sini, biarkan useEffect yang handle
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  }, [user, eventId, createChatSession]);

  const handleSendQuery = useCallback(async () => {
    if (!query.trim() || !currentSessionId) return;

    try {
      await sendChatMessage({ session_id: currentSessionId, message: query });
      setQuery("");
    } catch (error) {
      console.error("Failed to send AI query:", error);
    }
  }, [query, currentSessionId, sendChatMessage]);

  const handleGoBack = useCallback(() => {
    clearConversation();
    router.back();
  }, [clearConversation]);

  const renderMessage: ListRenderItem<AiMessage> = ({ item }) => (
    <View
      className={`p-3 my-2 max-w-[80%] rounded-xl ${
        item.role === "user"
          ? "bg-[#4E7D79] self-end"
          : "bg-[#F3DDBF] self-start"
      }`}
    >
      <Text
        className={`text-base ${
          item.role === "user" ? "text-white" : "text-[#1E1E1E]"
        }`}
      >
        {item.content}
      </Text>
    </View>
  );

  useEffect(() => {
    if (currentSessionId) {
      setIsChatStarted(true);
    }
  }, [currentSessionId]);

  return (
    <SafeAreaView className="flex-1 bg-[#EEC887]">
      <DetailHeader title="Chatbot" showBackButton={false} />
      {/* Custom Back Button */}
      <TouchableOpacity
        onPress={handleGoBack}
        style={{ position: "absolute", left: 16, top: 24, zIndex: 10 }}
      >
        <Ionicons name="arrow-back-circle-outline" size={30} color="#4E7D79" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-white rounded-t-3xl pt-2">
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
            <>
              <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingBottom: 12,
                  flexGrow: 1,
                  justifyContent: "flex-end",
                }}
              />

              {/* Input Box */}
              <View className="flex-row items-center px-4 py-3 bg-white border-t border-gray-200">
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
                  className="bg-[#4E7D79] rounded-full p-3"
                  disabled={isLoading || !query.trim()}
                >
                  <Ionicons
                    name={isLoading ? "reload" : "send"}
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
