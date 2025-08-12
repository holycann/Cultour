import DetailHeader from "@/app/_components/DetailHeader";
import { AiChatInput } from "@/app/event/[id]/ai/_components/AiChatInput";
import { AiChatStartButton } from "@/app/event/[id]/ai/_components/AiChatStartButton";
import { AiErrorModal } from "@/app/event/[id]/ai/_components/AiErrorModal";
import { AiMessageItem } from "@/app/event/[id]/ai/_components/AiMessageItem";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAi } from "@/hooks/useAi";
import { useAuth } from "@/hooks/useAuth";
import { AiMessage } from "@/types/Ai";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatbotScreen() {
  const router = useRouter();
  const { id: eventId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const {
    messages,
    currentSessionId,
    createChatSession,
    sendChatMessage,
    isLoading,
    clearConversation,
  } = useAi();

  const [query, setQuery] = useState("");
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Helper function to handle errors
  const handleError = useCallback((error: unknown) => {
    const errorStr =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "An unexpected error occurred";

    setErrorMessage(errorStr);
    setShowErrorModal(true);
    console.error(errorStr);
  }, []);

  useEffect(() => {
    clearConversation();
  }, []);

  const handleStartChat = useCallback(async () => {
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    try {
      const session = await createChatSession({ event_id: eventId });
      if (!session) throw new Error("Failed to create chat session");
      setIsChatStarted(true);
    } catch (error) {
      setIsChatStarted(false);
      handleError(error);
    }
  }, [user, eventId, createChatSession, handleError, router]);

  const handleSendQuery = useCallback(async () => {
    if (!query.trim()) return;

    try {
      // Send message
      await sendChatMessage({
        event_id: eventId,
        session_id: currentSessionId || "",
        message: query.trim(),
      });

      setQuery("");
    } catch (error) {
      handleError(error);
    }
  }, [query, currentSessionId, sendChatMessage, handleError, eventId]);

  const renderMessage = useCallback<ListRenderItem<AiMessage>>(
    ({ item }) => <AiMessageItem item={item} />,
    []
  );

  const keyExtractor = useCallback(
    (_item: AiMessage | null, index: number) => index.toString(),
    []
  );

  useEffect(() => {
    if (currentSessionId) {
      setIsChatStarted(true);
    }
  }, [currentSessionId]);

  if (!user) {
    return <LoadingScreen message="Authenticating..." />;
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-[#EEC887]"
    >
      <AiErrorModal
        visible={showErrorModal}
        errorMessage={errorMessage}
        onDismiss={() => setShowErrorModal(false)}
      />

      <DetailHeader title="Chatbot" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-white rounded-t-3xl pt-2">
          {!isChatStarted ? (
            <AiChatStartButton
              onStartChat={handleStartChat}
              isLoading={isLoading}
            />
          ) : (
            <>
              <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={keyExtractor}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingBottom: 12,
                  flexGrow: 1,
                  justifyContent: "flex-end",
                }}
              />

              <AiChatInput
                query={query}
                onChangeQuery={setQuery}
                onSendQuery={handleSendQuery}
                isLoading={isLoading}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
