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
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function DiscussionScreen() {
  const router = useRouter();
  const { name: eventName } = useLocalSearchParams<{ name: string }>();
  const { user } = useAuth();
  const { 
    discussionMessages, 
    sendDiscussionMessage, 
    fetchThreadMessages 
  } = useMessage();
  const { 
    createEventThread, 
    getThreadByEventId,
    joinEventThread
  } = useThread();

  const [query, setQuery] = useState("");
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);

  // Derive event ID from event name (you might want to replace this with actual event ID lookup)
  const eventId = eventName || "default_event";

  // Check and initialize thread on component mount
  useEffect(() => {
    const initializeThread = async () => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      try {
        // Check if thread exists for this event
        const existingThread = getThreadByEventId(eventId);
        
        if (existingThread) {
          // Join existing thread
          const thread = await joinEventThread({ 
            thread_id: existingThread.id, 
            user_id: user.id 
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

  // Start discussion thread
  const handleStartDiscussion = async () => {
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    try {
      // Create thread for the event
      const thread = await createEventThread({ 
        event_id: eventId, 
        creator_id: user.id 
      });

      if (thread) {
        setCurrentThread(thread);
        setIsChatStarted(true);
      }
    } catch (error) {
      console.error("Failed to start discussion:", error);
    }
  };

  // Send discussion message
  const handleSendMessage = async () => {
    if (!query.trim() || !currentThread) return;

    try {
      await sendDiscussionMessage(currentThread.id, query);
      setQuery("");
    } catch (error) {
      console.error("Failed to send discussion message:", error);
    }
  };

  // Go back handler
  const handleGoBack = () => {
    router.back();
  };

  // Render individual discussion message
  const renderMessage = ({ item }: { item: DiscussionMessage }) => (
    <View 
      className={`p-3 m-2 rounded-xl ${
        item.sender_id === user?.id 
          ? 'bg-[#4E7D79] self-end' 
          : 'bg-[#EEC887] self-start'
      }`}
    >
      <Text 
        className={`text-base ${
          item.sender_id === user?.id ? 'text-white' : 'text-[#4E7D79]'
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
        <Text className="text-xl font-bold text-[#4E7D79]">Discussion</Text>
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
              Community Discussion
            </Text>

            <TouchableOpacity 
              onPress={handleStartDiscussion}
              className="bg-[#4E7D79] rounded-xl py-4 px-8 w-full items-center"
            >
              <Text className="text-white font-bold text-lg">
                Start Discussion
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-1">
            {/* Discussion Messages */}
            <FlatList
              data={discussionMessages}
              renderItem={renderMessage}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
              inverted
            />

            {/* Input Area */}
            <View className="flex-row items-center p-4 bg-white">
              <TextInput
                placeholder="Write a message..."
                placeholderTextColor="#4E7D79"
                value={query}
                onChangeText={setQuery}
                className="flex-1 bg-[#F0F0F0] rounded-xl px-4 py-2 mr-2 text-[#4E7D79]"
                multiline
              />
              <TouchableOpacity 
                onPress={handleSendMessage}
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
