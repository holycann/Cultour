import DetailHeader from "@/app/_components/DetailHeader";
import { DiscussionJoinButton } from "@/app/event/[id]/discussion/_components/DiscussionJoinButton";
import { DiscussionMessageInput } from "@/app/event/[id]/discussion/_components/DiscussionMessageInput";
import { DiscussionMessageOptionsModal } from "@/app/event/[id]/discussion/_components/DiscussionMessageOptionsModal";
import { EditMessageModal } from "@/app/event/[id]/discussion/_components/EditMessageModal";
import { MessageItem } from "@/app/event/[id]/discussion/_components/MessageItem";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { useMessage } from "@/hooks/useMessage";
import { useThread } from "@/hooks/useThread";
import notify from "@/services/notificationService";
import { Message } from "@/types/Message";
import { isUserParticipant } from "@/types/Thread";
import { useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [loadingStatus, setLoadingStatus] = useState<{
    threadLoaded: boolean;
    messagesLoaded: boolean;
  }>({
    threadLoaded: false,
    messagesLoaded: false,
  });

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

  // First effect to load thread
  useEffect(() => {
    const loadThread = async () => {
      if (!user || !eventId) return;

      try {
        await fetchThreadByEventId(eventId, user.id);
        setLoadingStatus((prev) => ({ ...prev, threadLoaded: true }));
      } catch (error) {
        console.error("Failed to load thread:", error);
      }
    };

    loadThread();
  }, [user, eventId, fetchThreadByEventId]);

  // Second effect to load messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!thread || !user || !eventId || loadingStatus.messagesLoaded) return;

      try {
        const isParticipant = checkCurrentUserParticipation({
          thread,
          currentUserID: user.id,
        });

        if (isParticipant && thread.event_id === eventId) {
          await fetchThreadMessages(thread.id);
          setLoadingStatus((prev) => ({
            ...prev,
            messagesLoaded: true,
          }));
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };

    // Only load messages if thread is loaded and messages are not already loaded
    if (loadingStatus.threadLoaded && !loadingStatus.messagesLoaded) {
      loadMessages();
    }
  }, [
    thread?.id,
    user?.id,
    eventId,
    loadingStatus.threadLoaded,
    loadingStatus.messagesLoaded,
    checkCurrentUserParticipation,
    fetchThreadMessages,
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
          user_id: user.id,
          thread_id: thread.id,
          event_id: eventId,
        });

        if (!joinResult) {
          notify.error("Gagal Bergabung", {
            message: "Tidak dapat bergabung ke diskusi. Silakan coba lagi.",
          });
          return;
        }
      }

      // Fetch thread messages after joining
      await fetchThreadMessages(thread.id);
    } catch (error) {
      console.error("Failed to join thread:", error);
      notify.error("Kesalahan", { message: "Terjadi kesalahan. Silakan coba lagi." });
    }
  }, [user, thread, eventId, joinEventThread, fetchThreadMessages]);

  // Handler for sending a message
  const handleSendMessage = useCallback(async () => {
    // Validate message
    if (!query.trim()) {
      notify.info("Pesan Kosong", { message: "Silakan masukkan pesan sebelum mengirim." });
      return;
    }

    if (query.length > 1000) {
      notify.error("Pesan Terlalu Panjang", {
        message: "Pesan tidak boleh melebihi 1000 karakter.",
      });
      return;
    }

    if (!thread) {
      notify.error("Diskusi Tidak Tersedia", {
        message: "Tidak dapat mengirim pesan. Silakan bergabung terlebih dahulu.",
      });
      return;
    }

    try {
      const sentMessage = await sendDiscussionMessage({
        thread_id: thread.id,
        content: query,
      });

      if (!sentMessage) {
        notify.error("Gagal Mengirim", {
          message: "Tidak dapat mengirim pesan. Silakan coba lagi.",
        });
        return;
      }

      // Clear input after successful send
      setQuery("");
    } catch (error) {
      console.error("Failed to send message:", error);
      notify.error("Gagal Mengirim", {
        message: "Tidak dapat mengirim pesan. Silakan coba lagi.",
      });
    }
  }, [query, thread, sendDiscussionMessage]);

  // Handler for long-pressing a message (for edit/delete)
  const handleLongPressMessage = useCallback(
    (message: Message) => {
      if (message.sender?.id === user?.id || message.sender_id === user?.id)
        setSelectedMessage(message);
    },
    [user?.id]
  );

  // Handler for deleting a message
  const handleDeleteMessage = useCallback(async () => {
    if (!selectedMessage) return;

    // Show confirmation dialog before deleting
    notify.dialog("Hapus Pesan", {
      message: "Apakah Anda yakin ingin menghapus pesan ini?",
      confirmText: "Hapus",
      cancelText: "Batal",
      onConfirm: async () => {
        try {
          await deleteDiscussionMessage(selectedMessage.id);
          setSelectedMessage(null);
        } catch (error) {
          console.error("Failed to delete message:", error);
          notify.error("Gagal Menghapus", {
            message: "Tidak dapat menghapus pesan. Silakan coba lagi.",
          });
        }
      },
    });
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
      notify.error("Gagal Mengubah", {
        message: "Tidak dapat mengubah pesan. Silakan coba lagi.",
      });
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

  if (isThreadLoading) {
    return <LoadingScreen message="Loading discussion..." />;
  }

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
          {!loadingStatus.messagesLoaded ? (
            <LoadingScreen message="Loading messages..." />
          ) : !canInteract && thread ? (
            <DiscussionJoinButton
              onJoin={handleJoin}
              isLoading={isThreadLoading}
            />
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
              <DiscussionMessageInput
                query={query}
                onChangeQuery={setQuery}
                onSendMessage={handleSendMessage}
                isLoading={isMessageLoading}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      <DiscussionMessageOptionsModal
        visible={!!selectedMessage && !isEditModalVisible}
        message={selectedMessage}
        onEdit={openEditModal}
        onDelete={handleDeleteMessage}
        onCancel={() => setSelectedMessage(null)}
      />

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
