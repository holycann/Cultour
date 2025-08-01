import DetailHeader from "@/app/components/DetailHeader";
import { useAuth } from "@/hooks/useAuth";
import { useMessage } from "@/hooks/useMessage";
import { useThread } from "@/hooks/useThread";
import { DiscussionMessage } from "@/types/Message";
import { Thread } from "@/types/Thread";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
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

export default function DiscussionScreen() {
  const router = useRouter();
  const { id: eventId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { 
    discussionMessages, 
    sendDiscussionMessage, 
    fetchThreadMessages, 
    updateDiscussionMessage, 
    deleteDiscussionMessage 
  } = useMessage();
  const { 
    createEventThread, 
    getThreadByEventId, 
    joinEventThread, 
    checkCurrentUserParticipation 
  } = useThread();

  const [query, setQuery] = useState("");
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [isCurrentParticipant, setIsCurrentParticipant] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<DiscussionMessage | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Add new state for edit modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editMessageText, setEditMessageText] = useState("");

  const openEditModal = (message: DiscussionMessage) => {
    setSelectedMessage(message);
    setEditMessageText(message.content);
    setIsEditModalVisible(true);
  };

  const handleSaveEditedMessage = async () => {
    if (!selectedMessage || !editMessageText.trim()) return;

    try {
      const updatedMessage = await updateDiscussionMessage(selectedMessage.id, editMessageText);
      if (updatedMessage) {
        setIsEditModalVisible(false);
        setSelectedMessage(null);
        setEditMessageText("");
      }
    } catch (error) {
      console.error("Failed to update message:", error);
    }
  };

  useEffect(() => {
    const initializeThread = async () => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      try {
        // Check if thread exists for this event
        const existingThread = await getThreadByEventId(eventId, user.id);

        if (existingThread) {
          // If thread exists, set thread and check participation
          setCurrentThread(existingThread);
          const isParticipant = checkCurrentUserParticipation(existingThread, user.id);
          setIsCurrentParticipant(isParticipant);

          // Fetch messages if thread exists
          await fetchThreadMessages(existingThread.id);
        }
      } catch (error) {
        console.error("Failed to initialize thread:", error);
      }
    };

    initializeThread();
  }, [eventId, user, getThreadByEventId, checkCurrentUserParticipation]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (discussionMessages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [discussionMessages]);

  const handleStartDiscussion = async () => {
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    try {
      // Create a new thread if no thread exists
      const thread = await createEventThread({
        event_id: eventId,
        creator_id: user.id,
      });

      if (thread) {
        setCurrentThread(thread);
        setIsCurrentParticipant(true);
        await fetchThreadMessages(thread.id);
      }
    } catch (error) {
      console.error("Failed to start discussion:", error);
    }
  };

  const handleJoinDiscussion = async () => {
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    try {
      if (currentThread) {
        // Join the existing thread
        const thread = await joinEventThread({
          thread_id: currentThread.id,
          event_id: eventId,
        });
  
        if (thread) {
          setCurrentThread(thread);
          setIsCurrentParticipant(true);
          await fetchThreadMessages(thread.id);
        }
      }
    } catch (error) {
      console.error("Failed to join discussion:", error);
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

  const handleLeaveDiscussion = async () => {
    // Reset thread and participation state
    setCurrentThread(null);
    setIsCurrentParticipant(false);
  };

  const handleLongPressMessage = (message: DiscussionMessage) => {
    if (message.sender_id === user?.id) {
      setSelectedMessage(message);
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      const success = await deleteDiscussionMessage(selectedMessage.id);
      if (success) {
        // Optionally, you could trigger a refresh of messages or remove the message from local state
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleUpdateMessage = async () => {
    if (!selectedMessage || !query.trim()) return;

    try {
      const updatedMessage = await updateDiscussionMessage(selectedMessage.id, query);
      if (updatedMessage) {
        // Optionally, you could trigger a refresh of messages
        setQuery("");
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error("Failed to update message:", error);
    }
  };

  const renderMessage = ({ item }: { item: DiscussionMessage }) => {
    const isCurrentUser = item.sender_id === user?.id;
    return (
      <TouchableOpacity 
        onLongPress={() => handleLongPressMessage(item)}
        activeOpacity={0.7}
      >
        <View
          className={`flex-row items-end my-1 ${
            isCurrentUser ? "justify-end" : "justify-start"
          }`}
        >
          {!isCurrentUser && (
            <Image
              source={{ uri: "https://placehold.co/600x400?text=Sender" }}
              className="w-8 h-8 rounded-full mr-2"
            />
          )}
          <View
            className={`px-4 py-2 rounded-2xl max-w-[75%] ${
              isCurrentUser ? "bg-[#4E7D79] self-end" : "bg-[#EEC887] self-start"
            }`}
          >
            <Text
              className={`text-sm ${isCurrentUser ? 'text-white' : 'text-black'}`}
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

  // Existing code for message options modal remains the same
  
  // Add new Edit Message Modal
  const EditMessageModal = () => (
    <Modal
      transparent={true}
      visible={isEditModalVisible}
      animationType="slide"
      onRequestClose={() => setIsEditModalVisible(false)}
    >
      <View className="flex-1 justify-center bg-black/50 p-4">
        <View className="bg-white rounded-2xl p-6">
          <Text className="text-xl font-bold text-[#4E7D79] mb-4">Edit Message</Text>
          
          <TextInput
            value={editMessageText}
            onChangeText={setEditMessageText}
            multiline
            className="border border-gray-300 rounded-xl p-4 mb-4 min-h-[100px] text-[#4E7D79]"
            placeholder="Edit your message..."
            placeholderTextColor="#4E7D79"
          />
          
          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={() => setIsEditModalVisible(false)}
              className="bg-gray-200 rounded-xl py-3 px-6 mr-2 flex-1"
            >
              <Text className="text-[#4E7D79] text-center font-bold">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleSaveEditedMessage}
              className="bg-[#4E7D79] rounded-xl py-3 px-6 flex-1"
              disabled={!editMessageText.trim()}
            >
              <Text className="text-white text-center font-bold">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // In the return statement, add the new EditMessageModal
  return (
    <SafeAreaView className="flex-1 bg-[#EEC887]" edges={['top', 'left', 'right']}>
      <DetailHeader title="Discussion" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {!currentThread ? (
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
        ) : !isCurrentParticipant ? (
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
        ) : (
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
                disabled={!query.trim()}
              >
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Existing Message Options Modal */}
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
                setIsEditModalVisible(true);
                openEditModal(selectedMessage!);
              }}
              className="flex-row items-center py-3 border-b border-gray-200"
            >
              <MaterialIcons name="edit" size={24} color="#4E7D79" />
              <Text className="ml-3 text-[#4E7D79] text-base">Update Message</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleDeleteMessage}
              className="flex-row items-center py-3"
            >
              <MaterialIcons name="delete" size={24} color="red" />
              <Text className="ml-3 text-red-500 text-base">Delete Message</Text>
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

      {/* New Edit Message Modal */}
      <EditMessageModal />
    </SafeAreaView>
  );
}
