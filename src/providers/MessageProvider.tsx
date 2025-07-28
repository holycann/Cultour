import { MessageContext } from "@/contexts/MessageContext";
import { MessageService } from "@/services/messageService";
import { parseError } from "@/types/AppError";
import { AiChatContext, AiChatMessage, DiscussionMessage } from "@/types/Message";
import { showDialogError } from "@/utils/alert";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";

/**
 * Message state type for reducer
 */
interface MessageState {
  aiChats: { [eventId: string]: AiChatContext };
  discussionMessages: DiscussionMessage[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Message action types for reducer
 */
type MessageAction =
  | { type: "MESSAGE_START" }
  | { type: "ADD_EVENT_AI_MESSAGE"; payload: { eventId: string; message: AiChatMessage } }
  | { type: "CLEAR_EVENT_AI_CHAT"; payload: string }
  | { type: "DISCUSSION_MESSAGES_SUCCESS"; payload: DiscussionMessage[] }
  | { type: "ADD_DISCUSSION_MESSAGE"; payload: DiscussionMessage }
  | { type: "MESSAGE_ERROR"; payload: string }
  | { type: "MESSAGE_CLEAR_ERROR" }
  | { type: "MESSAGE_RESET" };

/**
 * Initial message state
 */
const initialState: MessageState = {
  aiChats: {},
  discussionMessages: [],
  isLoading: false,
  error: null,
};

/**
 * Reducer function for message state management
 */
function messageReducer(state: MessageState, action: MessageAction): MessageState {
  switch (action.type) {
    case "MESSAGE_START":
      return { ...state, isLoading: true, error: null };
    case "ADD_EVENT_AI_MESSAGE": {
      const { eventId, message } = action.payload;
      const existingChat = state.aiChats[eventId] || { event_id: eventId, messages: [] };
      
      return {
        ...state,
        isLoading: false,
        aiChats: {
          ...state.aiChats,
          [eventId]: {
            ...existingChat,
            messages: [...existingChat.messages, message],
            last_interaction_at: new Date()
          }
        }
      };
    }
    case "CLEAR_EVENT_AI_CHAT": {
      const { [action.payload]: removedChat, ...remainingChats } = state.aiChats;
      return {
        ...state,
        aiChats: remainingChats
      };
    }
    case "DISCUSSION_MESSAGES_SUCCESS":
      return { ...state, isLoading: false, discussionMessages: action.payload, error: null };
    case "ADD_DISCUSSION_MESSAGE":
      return { 
        ...state, 
        discussionMessages: [...state.discussionMessages, action.payload],
      };
    case "MESSAGE_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "MESSAGE_CLEAR_ERROR":
      return { ...state, error: null };
    case "MESSAGE_RESET":
      return initialState;
    default:
      return state;
  }
}

interface MessageProviderProps {
  children: ReactNode;
}

export function MessageProvider({ children }: MessageProviderProps) {
  const [state, dispatch] = useReducer(messageReducer, initialState);

  /**
   * Handle any API errors
   */
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const appError = parseError(error);
    const errorMessage = customMessage || appError.message;

    dispatch({ type: "MESSAGE_ERROR", payload: errorMessage });
    showDialogError("Error", errorMessage);
  }, []);

  /**
   * Ask AI about an event
   */
  const askAiAboutEvent = useCallback(
    async (eventId: string, query: string) => {
      dispatch({ type: "MESSAGE_START" });

      try {
        // User message
        const userMessage: AiChatMessage = {
          event_id: eventId,
          content: query,
          is_user_message: true,
          created_at: new Date()
        };

        // Dispatch user message first
        dispatch({ 
          type: "ADD_EVENT_AI_MESSAGE", 
          payload: { eventId, message: userMessage } 
        });

        // Get AI response
        const aiResponse = await MessageService.askAiAboutEvent(eventId, query);

        if (aiResponse) {
          dispatch({ 
            type: "ADD_EVENT_AI_MESSAGE", 
            payload: { eventId, message: aiResponse } 
          });

          return aiResponse;
        }

        return null;
      } catch (error) {
        handleError(error, "Gagal berkonsultasi dengan AI");
        return null;
      }
    },
    [handleError]
  );

  /**
   * Clear AI chat for a specific event
   */
  const clearEventAiChat = useCallback(
    (eventId: string) => {
      dispatch({ type: "CLEAR_EVENT_AI_CHAT", payload: eventId });
    },
    []
  );

  /**
   * Fetch thread messages
   */
  const fetchThreadMessages = useCallback(
    async (threadId: string) => {
      dispatch({ type: "MESSAGE_START" });

      try {
        const messages = await MessageService.fetchThreadMessages(threadId);
        dispatch({ type: "DISCUSSION_MESSAGES_SUCCESS", payload: messages });
      } catch (error) {
        handleError(error, "Gagal mengambil pesan thread");
      }
    },
    [handleError]
  );

  /**
   * Send discussion message
   */
  const sendDiscussionMessage = useCallback(
    async (threadId: string, content: string) => {
      dispatch({ type: "MESSAGE_START" });

      try {
        const message = await MessageService.sendDiscussionMessage(threadId, content);

        if (message) {
          dispatch({ type: "ADD_DISCUSSION_MESSAGE", payload: message });
          return message;
        }

        return null;
      } catch (error) {
        handleError(error, "Gagal mengirim pesan diskusi");
        return null;
      }
    },
    [handleError]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    dispatch({ type: "MESSAGE_CLEAR_ERROR" });
  }, []);

  /**
   * Context value
   */
  const value = useMemo(
    () => {
      // Get the current event's AI chat if exists
      const currentEventId = Object.keys(state.aiChats)[0];
      const aiChat = currentEventId ? state.aiChats[currentEventId] : undefined;

      return {
        aiChat,
        discussionMessages: state.discussionMessages,
        isLoading: state.isLoading,
        error: state.error,
        askAiAboutEvent,
        clearEventAiChat,
        fetchThreadMessages,
        sendDiscussionMessage,
        clearError,
      };
    },
    [
      state.aiChats,
      state.discussionMessages,
      state.isLoading,
      state.error,
      askAiAboutEvent,
      clearEventAiChat,
      fetchThreadMessages,
      sendDiscussionMessage,
      clearError,
    ]
  );

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
} 