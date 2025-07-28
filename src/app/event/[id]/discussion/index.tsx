import DetailHeader from "@/app/components/DetailHeader";
import { useAuth } from "@/hooks/useAuth";
import { useMessage } from "@/hooks/useMessage";
import { useThread } from "@/hooks/useThread";
import { DiscussionMessage } from "@/types/Message";
import { Thread } from "@/types/Thread";
import { Icon } from "@iconify/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function DiscussionScreen() {
  const router = useRouter();
  const { id: eventId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { discussionMessages, sendDiscussionMessage, fetchThreadMessages } =
    useMessage();
  const { createEventThread, getThreadByEventId, joinEventThread } =
    useThread();

  const [query, setQuery] = useState("");
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);

  useEffect(() => {
    const initializeThread = async () => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      try {
        const existingThread = getThreadByEventId(eventId);
        if (existingThread) {
          const thread = await joinEventThread({
            thread_id: existingThread.id,
            user_id: user.id,
          });

          if (thread) {
            setCurrentThread(thread);
            await fetchThreadMessages(thread.id);
            setIsChatStarted(true);
          }
        }
      } catch (error) {
        console.error("Failed to initialize thread:", error);
      }
    };

    initializeThread();
  }, [eventId, user]);

  const handleStartDiscussion = async () => {
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    try {
      const thread = await createEventThread({
        event_id: eventId,
        creator_id: user.id,
      });

      if (thread) {
        setCurrentThread(thread);
        setIsChatStarted(true);
      }
    } catch (error) {
      console.error("Failed to start discussion:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!query.trim() || !currentThread) return;

    try {
      await sendDiscussionMessage(currentThread.id, query);
      setQuery("");
    } catch (error) {
      console.error("Failed to send discussion message:", error);
    }
  };

  const renderMessage = ({ item }: { item: DiscussionMessage }) => {
    const isCurrentUser = item.sender_id === user?.id;
    return (
      <View
        className={`flex-row items-end my-1 ${
          isCurrentUser ? "justify-end" : "justify-start"
        }`}
      >
        {!isCurrentUser && (
          <Image
            source={{ uri: "https://via.placeholder.com/40" }}
            className="w-8 h-8 rounded-full mr-2"
          />
        )}
        <View
          className={`px-4 py-2 rounded-2xl max-w-[75%] ${
            isCurrentUser ? "bg-[#4E7D79] self-end" : "bg-[#D6E1DD] self-start"
          }`}
        >
          <Text
            className={`text-sm ${
              isCurrentUser ? "text-white" : "text-[#1E1E1E]"
            }`}
          >
            {item.content}
          </Text>
        </View>
        {isCurrentUser && (
          <Image
            source={require("@/assets/images/icon.png")}
            className="w-6 h-6 ml-2"
            resizeMode="contain"
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#EEC887]">
      <DetailHeader title="Discussion" />

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
              You only can see the discuss
            </Text>

            <TouchableOpacity
              onPress={handleStartDiscussion}
              className="bg-[#EEC887] px-6 py-2 rounded-full"
            >
              <Text className="text-[#1E1E1E] font-bold">
                Tap to Join Discussion
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-1 bg-white rounded-t-3xl pt-6 px-4">
            {/* Optional: Title Event */}
            <Text className="text-center text-base font-semibold text-[#1E1E1E] mb-4">
              Asia Afrika Festival
            </Text>

            <FlatList
              data={discussionMessages}
              renderItem={renderMessage}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "flex-end",
              }}
              inverted
            />

            {/* Input Area */}
            <View className="flex-row items-center mt-2 p-2 bg-white">
              <TextInput
                placeholder="Type your message..."
                placeholderTextColor="#4E7D79"
                value={query}
                onChangeText={setQuery}
                className="flex-1 bg-[#F3DDBF] text-[#1E1E1E] rounded-full px-4 py-2 mr-2"
                multiline
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                className="bg-[#4E7D79] rounded-full p-2"
              >
                <Icon icon="mdi:send" width={24} height={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
