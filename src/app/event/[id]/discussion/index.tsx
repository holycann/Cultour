import DetailHeader from "@/app/components/DetailHeader";
import { useAuth } from "@/hooks/useAuth";
import { useMessage } from "@/hooks/useMessage";
import { useThread } from "@/hooks/useThread";
import { DiscussionMessage } from "@/types/Message";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Component for rendering an individual message
 */
const MessageItem = ({
  item,
  currentUserId,
  onLongPress,
}: {
  item: DiscussionMessage;
  currentUserId?: string;
  onLongPress: (message: DiscussionMessage) => void;
}) => {
  const isCurrentUser = item.sender_id === currentUserId;

  return (
    <TouchableOpacity onLongPress={() => onLongPress(item)} activeOpacity={0.7}>
      <View
        className={`flex-row items-end my-1 ${
          isCurrentUser ? "justify-end" : "justify-start"
        }`}
      >
        {!isCurrentUser && (
          <Image
            source={{ uri: "https://placehold.co/400x300.jpg?text=Anonymous" }}
            className="w-8 h-8 rounded-full mr-2"
          />
        )}
        <View
          className={`px-4 py-2 rounded-2xl max-w-[75%] ${
            isCurrentUser ? "bg-[#4E7D79] self-end" : "bg-[#EEC887] self-start"
          }`}
        >
          <Text
            className={`text-sm ${isCurrentUser ? "text-white" : "text-black"}`}
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
    </TouchableOpacity>
  );
};

/**
 * Component for editing a message
 */
const EditMessageModal = ({
  visible,
  message,
  onSave,
  onCancel,
  onChangeText,
  isLoading,
}: {
  isLoading: boolean;
  visible: boolean;
  message: string;
  onSave: () => void;
  onCancel: () => void;
  onChangeText: (text: string) => void;
}) => (
  <Modal
    transparent={true}
    visible={visible}
    animationType="slide"
    onRequestClose={onCancel}
  >
    <View className="flex-1 justify-center bg-black/50 p-4">
      <View className="bg-white rounded-2xl p-6">
        <Text className="text-xl font-bold text-[#4E7D79] mb-4">
          Edit Message
        </Text>

        <TextInput
          value={message}
          onChangeText={onChangeText}
          multiline
          className="border border-gray-300 rounded-xl p-4 mb-4 min-h-[100px] text-[#4E7D79]"
          placeholder="Edit your message..."
          placeholderTextColor="#4E7D79"
        />

        <View className="flex-row justify-between">
          <TouchableOpacity
            onPress={onCancel}
            className="bg-gray-200 rounded-xl py-3 px-6 mr-2 flex-1"
          >
            <Text className="text-[#4E7D79] text-center font-bold">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSave}
            className="bg-[#4E7D79] rounded-xl py-3 px-6 flex-1"
            disabled={!message.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white text-center font-bold">Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

/**
 * Main discussion screen component
 */
export default function DiscussionScreen() {
  const router = useRouter();
  const { id: eventId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const {
    discussionMessages,
    sendDiscussionMessage,
    fetchThreadMessages,
    updateDiscussionMessage,
    deleteDiscussionMessage,
    isLoading: isMessageLoading,
  } = useMessage();

  const {
    currentThread,
    createEventThread,
    getThreadByEventId,
    joinEventThread,
    checkCurrentUserParticipation,
    isCurrentUserParticipant,
    isLoading: isThreadLoading,
  } = useThread();

  // Local UI state
  const [query, setQuery] = useState("");
  const [selectedMessage, setSelectedMessage] =
    useState<DiscussionMessage | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editMessageText, setEditMessageText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Initialize thread and messages
  useEffect(() => {
    const initializeThread = async () => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      try {
        console.log("Checking for existing thread for event:", eventId);

        // Check if thread exists for this event
        const existingThread = await getThreadByEventId(eventId, user.id);

        if (existingThread) {
          console.log("Thread found, checking user participation");
          // Thread exists, check if user is participant and load messages
          const isParticipant = checkCurrentUserParticipation(
            existingThread,
            user.id
          );
          console.log("User is participant:", isParticipant);

          // Fetch messages if thread exists
          await fetchThreadMessages(existingThread.id);
        } else {
          console.log("No thread exists for this event");
          // No thread exists for this event
          Alert.alert(
            "No Discussion",
            "There's no discussion thread for this event yet. You can create one to start the conversation.",
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        console.error("Failed to initialize thread:", error);
        Alert.alert("Error", "Failed to load discussion thread.");
      }
    };

    initializeThread();
  }, [
    eventId,
    user,
    getThreadByEventId,
    checkCurrentUserParticipation,
    fetchThreadMessages,
  ]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (discussionMessages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [discussionMessages]);

  // Message action handlers
  const handleStartDiscussion = useCallback(async () => {
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    try {
      console.log("Creating new thread for event:", eventId);

      // Create a new thread if no thread exists
      const isThreadCreated = await createEventThread({
        event_id: eventId,
        creator_id: user.id,
      });

      if (isThreadCreated) {
        console.log("Thread created successfully, loading messages");
        // Creator is automatically added as participant
        // Load messages after thread creation

        const thread = await getThreadByEventId(eventId, user.id);

        await joinEventThread({
          thread_id: thread?.id as string,
          event_id: eventId,
        });
        await fetchThreadMessages(thread?.id as string);
      }
    } catch (error) {
      console.error("Failed to start discussion:", error);
      Alert.alert("Error", "Failed to create discussion thread.");
    }
  }, [user, eventId, createEventThread, fetchThreadMessages, router]);

  const handleJoinDiscussion = useCallback(async () => {
    if (!user || !currentThread) {
      return;
    }

    try {
      console.log("Joining thread:", currentThread.id);

      // Join the existing thread
      await joinEventThread({
        thread_id: currentThread.id,
        event_id: eventId,
      });

      const thread = await getThreadByEventId(eventId, user.id);

      if (isCurrentUserParticipant) {
        console.log("Successfully joined thread, loading messages");
        // After joining, load messages
        await fetchThreadMessages(thread?.id as string);
      }
    } catch (error) {
      console.error("Failed to join discussion:", error);
      Alert.alert("Error", "Failed to join discussion thread.");
    }
  }, [user, currentThread, eventId, joinEventThread, fetchThreadMessages]);

  const handleSendMessage = useCallback(async () => {
    if (!query.trim() || !currentThread) return;

    try {
      await sendDiscussionMessage(currentThread.id, query);
      setQuery("");
      // Messages will update automatically via the hook
    } catch (error) {
      console.error("Failed to send discussion message:", error);
      Alert.alert("Error", "Failed to send message.");
    }
  }, [query, currentThread, sendDiscussionMessage]);

  const handleLongPressMessage = useCallback(
    (message: DiscussionMessage) => {
      if (message.sender_id === user?.id) {
        setSelectedMessage(message);
      }
    },
    [user?.id]
  );

  const handleDeleteMessage = useCallback(async () => {
    if (!selectedMessage) return;

    try {
      await deleteDiscussionMessage(selectedMessage.id);
      setSelectedMessage(null);
    } catch (error) {
      console.error("Failed to delete message:", error);
      Alert.alert("Error", "Failed to delete message.");
    }
  }, [selectedMessage, deleteDiscussionMessage]);

  const openEditModal = useCallback((message: DiscussionMessage) => {
    setSelectedMessage(message);
    setEditMessageText(message.content);
    setIsEditModalVisible(true);
  }, []);

  const handleSaveEditedMessage = useCallback(async () => {
    if (!selectedMessage || !editMessageText.trim()) return;

    try {
      await updateDiscussionMessage(selectedMessage.id, editMessageText);
      setIsEditModalVisible(false);
      setSelectedMessage(null);
      setEditMessageText("");
    } catch (error) {
      console.error("Failed to update message:", error);
      Alert.alert("Error", "Failed to update message.");
    }
  }, [selectedMessage, editMessageText, updateDiscussionMessage]);

  // Render message list
  const renderMessage = useCallback(
    ({ item }: { item: DiscussionMessage }) => (
      <MessageItem
        item={item}
        currentUserId={user?.id}
        onLongPress={handleLongPressMessage}
      />
    ),
    [user?.id, handleLongPressMessage]
  );

  // Show loading indicator
  // if (isLoading) {
  //   return (
  //     <SafeAreaView
  //       className="flex-1 bg-[#EEC887] justify-center items-center"
  //       edges={["top", "left", "right"]}
  //     >
  //       <DetailHeader title="Discussion" />
  //       <Text className="text-[#4E7D79] text-lg">Loading discussion...</Text>
  //     </SafeAreaView>
  //   );
  // }

  // Render appropriate screen based on state
  const renderContent = () => {
    // No thread exists yet
    if (!currentThread || currentThread?.event_id !== eventId) {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-2xl font-bold text-[#4E7D79] mb-4 text-center">
            Cultour
          </Text>
          <Text className="text-base text-[#4E7D79] mb-8 text-center">
            Start a discussion about the event
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
      );
    }

    // Thread exists but user is not a participant
    else if (!isCurrentUserParticipant) {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-2xl font-bold text-[#4E7D79] mb-4 text-center">
            Cultour
          </Text>
          <Text className="text-base text-[#4E7D79] mb-8 text-center">
            Join the existing discussion about the event
          </Text>

          <TouchableOpacity
            onPress={handleJoinDiscussion}
            className="bg-[#4E7D79] rounded-xl py-4 px-8 w-full items-center"
          >
            <Text className="text-white font-bold text-lg">
              Join Discussion
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // User is a participant in the thread
    else {
      return (
        <View className="flex-1 bg-white rounded-t-3xl pt-6 px-4">
          <FlatList
            ref={flatListRef}
            data={discussionMessages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "flex-start",
            }}
            inverted={false}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-10">
                <Text className="text-[#4E7D79] text-base">
                  No messages yet. Be the first to start the conversation!
                </Text>
              </View>
            }
          />

          {/* Input Box */}
          <View className="flex-row items-center px-4 py-3 bg-white border-t border-gray-200">
            <TextInput
              placeholder="Type your message..."
              placeholderTextColor="#4E7D79"
              value={query}
              onChangeText={setQuery}
              className="flex-1 bg-[#F0F0F0] rounded-xl px-4 py-2 mr-2 text-[#4E7D79]"
              multiline
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              className="bg-[#4E7D79] rounded-full p-3"
              disabled={!query.trim() || isMessageLoading}
            >
              {isMessageLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#EEC887]"
      edges={["top", "left", "right"]}
    >
      <DetailHeader title="Discussion" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {renderContent()}
      </KeyboardAvoidingView>

      {/* Message Options Modal */}
      <Modal
        transparent={true}
        visible={!!selectedMessage && !isEditModalVisible}
        animationType="slide"
        onRequestClose={() => setSelectedMessage(null)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-4">
            <TouchableOpacity
              onPress={() => {
                openEditModal(selectedMessage!);
              }}
              className="flex-row items-center py-3 border-b border-gray-200"
            >
              <MaterialIcons name="edit" size={24} color="#4E7D79" />
              <Text className="ml-3 text-[#4E7D79] text-base">
                Update Message
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteMessage}
              className="flex-row items-center py-3"
            >
              <MaterialIcons name="delete" size={24} color="red" />
              <Text className="ml-3 text-red-500 text-base">
                Delete Message
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedMessage(null)}
              className="mt-4 bg-[#F0F0F0] rounded-xl py-3 items-center"
            >
              <Text className="text-[#4E7D79] font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Message Modal */}
      <EditMessageModal
        visible={isEditModalVisible}
        message={editMessageText}
        onSave={handleSaveEditedMessage}
        onCancel={() => setIsEditModalVisible(false)}
        onChangeText={setEditMessageText}
        isLoading={isMessageLoading}
      />
    </SafeAreaView>
  );
}
