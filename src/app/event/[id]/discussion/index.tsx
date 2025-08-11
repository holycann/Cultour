import DetailHeader from "@/app/components/DetailHeader";
import { useAuth } from "@/hooks/useAuth";
import { useMessage } from "@/hooks/useMessage";
import { useThread } from "@/hooks/useThread";
import { Message } from "@/types/Message";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

import { isUserParticipant } from "@/types/Thread";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Component for rendering an individual message
 */
const MessageItem = ({
  item,
  currentUserId,
  onLongPress,
}: {
  item: Message;
  currentUserId?: string;
  onLongPress: (message: Message) => void;
}) => {
  const isCurrentUser =
    item.sender_id === currentUserId || item.sender?.id === currentUserId;

  const displayName = isCurrentUser
    ? "Anda"
    : (item as any)?.sender?.fullname ||
      (item as any)?.sender?.email ||
      "Pengguna Lain";

  const timeStr = (() => {
    try {
      const d = item.created_at ? new Date(item.created_at) : new Date();
      return d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  })();

  // Derive avatar placeholder (initials + color) for non-current users
  const initials = useMemo(() => {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || "U";
    const second = parts[1]?.[0] || "";
    return `${first}${second}`.toUpperCase();
  }, [displayName]);

  const avatarColor = useMemo(() => {
    const palette = [
      "EEC887",
      "F3DDBF",
      "D1E8E4",
      "CFE8FF",
      "FFE6CC",
      "E7D4FF",
      "FADADD",
    ]; // light backgrounds
    const sid = String(item.sender?.id || "0");
    const sum = sid.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return palette[sum % palette.length];
  }, [item.sender?.id]);

  const avatarUrl = `https://placehold.co/48x48/${avatarColor}/333.jpg?text=${encodeURIComponent(initials)}`;

  return (
    <TouchableOpacity onLongPress={() => onLongPress(item)} activeOpacity={0.7}>
      <View
        className={`flex-row items-start my-2 ${
          isCurrentUser ? "justify-end" : "justify-start"
        }`}
      >
        {!isCurrentUser && (
          <Image
            source={{ uri: (item.sender as any)?.avatar_url || avatarUrl }}
            className="w-8 h-8 rounded-full mr-2"
          />
        )}
        <View className={`${isCurrentUser ? "items-end" : "items-start"}`}>
          <Text className="text-[11px] text-gray-500 mb-1">
            {isCurrentUser
              ? `${timeStr} • ${displayName}`
              : `${displayName} • ${timeStr}`}
          </Text>
          <View
            className={`px-3 py-2 rounded-2xl ${
              isCurrentUser
                ? "bg-[#4E7D79] rounded-br-md"
                : "bg-[#EEC887] rounded-bl-md"
            }`}
            style={{
              minWidth: 60,
              maxWidth: "100%",
            }}
          >
            <Text
              className={`text-sm leading-5 ${
                isCurrentUser ? "text-white" : "text-black"
              }`}
              style={{
                flexShrink: 1,
              }}
            >
              {item.content}
            </Text>
          </View>
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
    thread,
    fetchThreadByEventId,
    joinEventThread,
    checkCurrentUserParticipation,
    isCurrentUserParticipant,
    isLoading: isThreadLoading,
  } = useThread();

  // State for message input and interaction
  const [query, setQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editMessageText, setEditMessageText] = useState("");
  const [isMessageUpdated, setIsMessageUpdated] = useState(false);

  // Ref for scrolling to bottom of messages
  const flatListRef = useRef<FlatList>(null);

  // Derived state for thread interaction
  const canInteract = useMemo(() => {
    if (!thread || !user) return false;

    return (
      isCurrentUserParticipant ||
      isUserParticipant({
        thread: thread,
        currentUserID: user?.id,
      })
    );
  }, [isCurrentUserParticipant, thread, user]);

  useEffect(() => {
    const loadThread = async () => {
      if (!user || !eventId) return;

      try {
        await fetchThreadByEventId(eventId, user.id);
      } catch (error) {
        console.error("Failed to load thread:", error);
      }
    };

    loadThread();
  }, [user, eventId, fetchThreadByEventId]);

  // Separate effect untuk handle thread changes
  useEffect(() => {
    if (!thread || !user) return;

    const loadMessages = async () => {
      await fetchThreadMessages(thread.id);
      setIsMessageUpdated(true);
    };

    const isParticipant = checkCurrentUserParticipation({
      thread,
      currentUserID: user.id,
    });

    if (isParticipant && thread.event_id === eventId) {
      loadMessages();
    }
  }, [
    thread,
    user,
    checkCurrentUserParticipation,
    fetchThreadMessages,
    eventId,
    isMessageUpdated,
  ]);

  // Handler for joining the thread
  const handleJoin = useCallback(async () => {
    if (!user || !eventId || !thread) return;

    try {
      // Check if user is already a participant
      const isAlreadyParticipant = checkCurrentUserParticipation({
        thread,
        currentUserID: user.id,
      });

      if (!isAlreadyParticipant) {
        // Join the thread if not already a participant
        const joinResult = await joinEventThread({
          thread_id: thread.id,
          event_id: eventId,
        });

        if (!joinResult) {
          Alert.alert(
            "Gagal Bergabung",
            "Tidak dapat bergabung ke diskusi. Silakan coba lagi."
          );
          return;
        }
      }

      // Fetch thread messages after joining
      await fetchThreadMessages(thread.id);
    } catch (error) {
      console.error("Failed to join thread:", error);
      Alert.alert("Kesalahan", "Terjadi kesalahan. Silakan coba lagi.");
    }
  }, [user, thread, eventId, joinEventThread, fetchThreadMessages]);

  // Handler for sending a message
  const handleSendMessage = useCallback(async () => {
    // Validate message
    if (!query.trim()) {
      Alert.alert("Pesan Kosong", "Silakan masukkan pesan sebelum mengirim.");
      return;
    }

    if (query.length > 1000) {
      Alert.alert(
        "Pesan Terlalu Panjang",
        "Pesan tidak boleh melebihi 1000 karakter."
      );
      return;
    }

    if (!thread) {
      Alert.alert(
        "Diskusi Tidak Tersedia",
        "Tidak dapat mengirim pesan. Silakan bergabung terlebih dahulu."
      );
      return;
    }

    try {
      const sentMessage = await sendDiscussionMessage({
        thread_id: thread.id,
        content: query,
      });

      if (!sentMessage) {
        Alert.alert(
          "Gagal Mengirim",
          "Tidak dapat mengirim pesan. Silakan coba lagi."
        );
        return;
      }

      // Clear input after successful send
      setQuery("");
    } catch (error) {
      console.error("Failed to send message:", error);
      Alert.alert(
        "Gagal Mengirim",
        "Tidak dapat mengirim pesan. Silakan coba lagi."
      );
    }
  }, [query, thread, sendDiscussionMessage]);

  // Handler for long-pressing a message (for edit/delete)
  const handleLongPressMessage = useCallback(
    (message: Message) => {
      if (message.sender?.id === user?.id) setSelectedMessage(message);
    },
    [user?.id]
  );

  // Handler for deleting a message
  const handleDeleteMessage = useCallback(async () => {
    if (!selectedMessage) return;

    try {
      await deleteDiscussionMessage(selectedMessage.id);
      setSelectedMessage(null);
    } catch (error) {
      console.error("Failed to delete message:", error);
      Alert.alert(
        "Gagal Menghapus",
        "Tidak dapat menghapus pesan. Silakan coba lagi."
      );
    }
  }, [selectedMessage, deleteDiscussionMessage]);

  // Open edit modal for a message
  const openEditModal = useCallback((message: Message) => {
    setSelectedMessage(message);
    setEditMessageText(message.content);
    setIsEditModalVisible(true);
  }, []);

  // Handler for saving edited message
  const handleSaveEditedMessage = useCallback(async () => {
    if (!selectedMessage || !editMessageText.trim()) return;

    try {
      await updateDiscussionMessage({
        id: selectedMessage.id,
        content: editMessageText,
      });

      // Reset modal and selected message state
      setIsEditModalVisible(false);
      setSelectedMessage(null);
      setEditMessageText("");
    } catch (error) {
      console.error("Failed to update message:", error);
      Alert.alert(
        "Gagal Mengubah",
        "Tidak dapat mengubah pesan. Silakan coba lagi."
      );
    }
  }, [selectedMessage, editMessageText, updateDiscussionMessage]);

  // Render individual message
  const renderMessage = useCallback(
    ({ item }: { item: Message }) => (
      <MessageItem
        item={item}
        currentUserId={user?.id}
        onLongPress={handleLongPressMessage}
      />
    ),
    [user?.id, handleLongPressMessage]
  );

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
        <View className="flex-1 bg-white rounded-t-3xl pt-6 px-4">
          {isThreadLoading || !isMessageUpdated ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color="#4E7D79" size="large" />
            </View>
          ) : !canInteract && thread ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-lg text-gray-600 mb-4">
                Anda belum bergabung dalam diskusi ini
              </Text>
              <TouchableOpacity
                onPress={handleJoin}
                className="bg-[#4E7D79] rounded-xl py-3 px-6"
                disabled={isThreadLoading}
              >
                <Text className="text-white font-bold">Bergabung</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <FlatList
                ref={flatListRef}
                data={discussionMessages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: "flex-start",
                }}
                ListEmptyComponent={
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-gray-500">Belum ada pesan</Text>
                  </View>
                }
              />
              <View className="flex-row items-center px-4 py-3 bg-white border-t border-gray-200">
                <TextInput
                  placeholder="Ketik pesan..."
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
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Message Options Modal */}
      <Modal
        transparent
        visible={!!selectedMessage && !isEditModalVisible}
        animationType="slide"
        onRequestClose={() => setSelectedMessage(null)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-4">
            <TouchableOpacity
              onPress={() => openEditModal(selectedMessage!)}
              className="flex-row items-center py-3 border-b border-gray-200"
            >
              <MaterialIcons name="edit" size={24} color="#4E7D79" />
              <Text className="ml-3 text-[#4E7D79] text-base">Ubah Pesan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteMessage}
              className="flex-row items-center py-3"
            >
              <MaterialIcons name="delete" size={24} color="red" />
              <Text className="ml-3 text-red-500 text-base">Hapus Pesan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedMessage(null)}
              className="mt-4 bg-[#F0F0F0] rounded-xl py-3 items-center"
            >
              <Text className="text-[#4E7D79] font-bold">Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
