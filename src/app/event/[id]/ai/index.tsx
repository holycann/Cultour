import DetailHeader from "@/app/components/DetailHeader";
import Colors from "@/constants/Colors";
import { useAi } from "@/hooks/useAi";
import { useAuth } from "@/hooks/useAuth";
import { AiMessage } from "@/types/Ai";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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

  const renderMessage: ListRenderItem<AiMessage> = ({ item }) => {
    // Function to format text - add line break after each period
    const formatTextWithLineBreaks = (text: string) => {
      return text.replace(/\. /g, ".\n");
    };

    return (
      <>
        {/* Display sender name */}
        <Text
          style={[
            styles.senderName,
            {
              color: Colors.black,
              fontSize: 12,
              fontWeight: "600",
              marginBottom: 4,
              textAlign: item.is_user_message ? "right" : "left",
            },
          ]}
        >
          {item.is_user_message ? "Anda" : "Cultour AI Assistant"}
        </Text>
        <View
          style={[
            styles.messageContainer,
            {
              backgroundColor: item.is_user_message ? "#4E7D79" : "#F3DDBF",
              alignSelf: item.is_user_message ? "flex-end" : "flex-start",
              maxWidth: "85%", // Prevent messages from being too wide
              marginVertical: 4, // Add spacing between messages
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 16,
              // Add shadow for better visual separation
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: item.is_user_message ? "white" : "#1E1E1E",
                fontSize: 16, // Comfortable reading size
                lineHeight: 24, // 1.5x line height for better readability
                fontFamily: Platform.OS === "ios" ? "System" : "Roboto", // Use system fonts
                letterSpacing: 0.3, // Slight letter spacing for clarity
                textAlign: "left", // Ensure consistent alignment
              },
            ]}
            selectable={true} // Allow text selection
          >
            {formatTextWithLineBreaks(item.response[0])}
          </Text>
        </View>
      </>
    );
  };

  useEffect(() => {
    if (currentSessionId) {
      setIsChatStarted(true);
    }
  }, [currentSessionId]);

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-[#EEC887]"
    >
      {/* Error Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showErrorModal}
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.errorModalContainer}>
          <View style={styles.errorModalContent}>
            <Text style={styles.errorModalTitle}>Chat Error</Text>
            <Text style={styles.errorModalMessage}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.errorModalButton}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.errorModalButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DetailHeader title="Chatbot" />

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
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">
                    Start Chat
                  </Text>
                )}
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
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Ionicons name="send" size={20} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    padding: 12,
    marginVertical: 8,
    maxWidth: "80%",
    borderRadius: 16,
  },
  messageText: {
    fontSize: 16,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    marginHorizontal: 4
  },
  // Style baru yang ditambahkan untuk timestamp
  timestampText: {
    fontSize: 12,
    marginTop: 4,
  },
  errorModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  errorModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  errorModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.error || "red",
    marginBottom: 15,
  },
  errorModalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  errorModalButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  errorModalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
