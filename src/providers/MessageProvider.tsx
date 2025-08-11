import { MessageContext, MessageContextType } from "@/contexts/MessageContext";
import { MessageService } from "@/services/messageService";
import { Pagination } from "@/types/ApiResponse";
import {
  Message,
  SendDiscussionMessage,
  UpdateDiscussionMessage,
} from "@/types/Message";
import { showDialogError } from "@/utils/alert";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";

type MessageState = {
  discussionMessages: Message[];
  isLoading: boolean;
  error: string | null;
};

type MessageAction =
  | { type: "MESSAGE_START" }
  | { type: "DISCUSSION_MESSAGES_SUCCESS"; payload: Message[] }
  | { type: "ADD_DISCUSSION_MESSAGE"; payload: Message }
  | { type: "UPDATE_DISCUSSION_MESSAGE"; payload: Message }
  | { type: "DELETE_DISCUSSION_MESSAGE"; payload: string }
  | { type: "MESSAGE_ERROR"; payload: string }
  | { type: "MESSAGE_CLEAR_ERROR" }
  | { type: "MESSAGE_RESET" };

const initialState: MessageState = {
  discussionMessages: [],
  isLoading: false,
  error: null,
};

function messageReducer(
  state: MessageState,
  action: MessageAction
): MessageState {
  switch (action.type) {
    case "MESSAGE_START":
      return { ...state, isLoading: true, error: null };
    case "DISCUSSION_MESSAGES_SUCCESS":
      return {
        ...state,
        isLoading: false,
        discussionMessages: action.payload,
        error: null,
      };
    case "ADD_DISCUSSION_MESSAGE":
      return {
        ...state,
        discussionMessages: [...state.discussionMessages, action.payload],
        isLoading: false,
      };
    case "UPDATE_DISCUSSION_MESSAGE":
      return {
        ...state,
        discussionMessages: state.discussionMessages.map((msg) =>
          msg.id === action.payload.id ? action.payload : msg
        ),
        isLoading: false,
      };
    case "DELETE_DISCUSSION_MESSAGE":
      return {
        ...state,
        discussionMessages: state.discussionMessages.filter(
          (msg) => msg.id !== action.payload
        ),
        isLoading: false,
      };
    case "MESSAGE_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "MESSAGE_CLEAR_ERROR":
      return { ...state, error: null, isLoading: false };
    case "MESSAGE_RESET":
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

export function MessageProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(messageReducer, initialState);

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const errorMessage =
      error instanceof Error
        ? error.message
        : customMessage || "An unexpected message error occurred";

    dispatch({ type: "MESSAGE_ERROR", payload: errorMessage });
    showDialogError("Message Error", errorMessage);
  }, []);

  const fetchThreadMessages = useCallback(
    async (
      threadId: string,
      options?: {
        pagination?: Pagination;
      }
    ): Promise<Message[] | null> => {
      dispatch({ type: "MESSAGE_START" });

      try {
        const response = await MessageService.fetchMessagesByThread(threadId);

        if (response.success && response.data) {
          dispatch({
            type: "DISCUSSION_MESSAGES_SUCCESS",
            payload: response.data,
          });
          return response.data;
        }

        return null;
      } catch (error) {
        handleError(error, "Gagal mengambil pesan thread");
        return null;
      }
    },
    [handleError]
  );

  const sendDiscussionMessage = useCallback(
    async (payload: SendDiscussionMessage): Promise<Message | null> => {
      // Validate input parameters
      if (!payload.thread_id) {
        handleError(
          new Error("Thread ID is required"),
          "Gagal mengirim pesan: Thread ID tidak valid"
        );
        return null;
      }

      // Validate message content
      const trimmedContent = payload.content.trim();
      if (!trimmedContent) {
        handleError(
          new Error("Message content cannot be empty"),
          "Gagal mengirim pesan: Konten pesan kosong"
        );
        return null;
      }

      if (trimmedContent.length > 1000) {
        handleError(
          new Error("Message content exceeds maximum length"),
          "Gagal mengirim pesan: Pesan terlalu panjang"
        );
        return null;
      }

      dispatch({ type: "MESSAGE_START" });

      try {
        const message = await MessageService.sendDiscussionMessage(payload);

        // Comprehensive message validation
        if (!message) {
          handleError(
            new Error("Failed to send message"),
            "Gagal mengirim pesan diskusi"
          );
          return null;
        }

        // Dispatch message
        dispatch({
          type: "ADD_DISCUSSION_MESSAGE",
          payload: message,
        });

        return message;
      } catch (error) {
        handleError(error, "Gagal mengirim pesan diskusi");
        return null;
      }
    },
    [handleError]
  );

  const updateDiscussionMessage = useCallback(
    async (payload: UpdateDiscussionMessage): Promise<Message | null> => {
      dispatch({ type: "MESSAGE_START" });

      try {
        const updatedMessage =
          await MessageService.updateDiscussionMessage(payload);

        if (updatedMessage) {
          dispatch({
            type: "UPDATE_DISCUSSION_MESSAGE",
            payload: updatedMessage,
          });
          return updatedMessage;
        }

        return null;
      } catch (error) {
        handleError(error, "Gagal memperbarui pesan diskusi");
        return null;
      }
    },
    [handleError]
  );

  const deleteDiscussionMessage = useCallback(
    async (messageId: string): Promise<boolean> => {
      dispatch({ type: "MESSAGE_START" });

      try {
        const isDeleted =
          await MessageService.deleteDiscussionMessage(messageId);

        if (isDeleted) {
          dispatch({ type: "DELETE_DISCUSSION_MESSAGE", payload: messageId });
          return true;
        }

        return false;
      } catch (error) {
        handleError(error, "Gagal menghapus pesan diskusi");
        return false;
      }
    },
    [handleError]
  );

  const clearError = useCallback(() => {
    dispatch({ type: "MESSAGE_CLEAR_ERROR" });
  }, []);

  const resetMessageState = useCallback(() => {
    dispatch({ type: "MESSAGE_RESET" });
  }, []);

  const contextValue = useMemo<MessageContextType>(
    () => ({
      discussionMessages: state.discussionMessages,
      isLoading: state.isLoading,
      error: state.error,
      fetchThreadMessages,
      sendDiscussionMessage,
      updateDiscussionMessage,
      deleteDiscussionMessage,
      clearError,
      resetMessageState,
    }),
    [
      state.discussionMessages,
      state.isLoading,
      state.error,
      fetchThreadMessages,
      sendDiscussionMessage,
      updateDiscussionMessage,
      deleteDiscussionMessage,
      clearError,
      resetMessageState,
    ]
  );

  return (
    <MessageContext.Provider value={contextValue}>
      {children}
    </MessageContext.Provider>
  );
}