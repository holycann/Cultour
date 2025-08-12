import notify from "@/services/notificationService";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";
import AiContext, { AiContextType } from "../contexts/AiContext";
import { AiService } from "../services/aiService";
import {
  AiEventDescription,
  AiEventDescriptionPayload,
  AiMessage,
  AiMessagePayload,
  AiSession,
  AiSessionCreate,
} from "../types/Ai";
import { createAsyncActions, withAsyncReducer } from "./asyncFactory";

type AiState = {
  messages: AiMessage[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;
};

type AiAction =
  | { type: "AI_SESSION_SUCCESS"; payload: AiSession }
  | { type: "SEND_MESSAGE"; payload: AiMessage }
  | { type: "AI_MESSAGE_SUCCESS"; payload: AiMessage };

const initialState: AiState = {
  messages: [],
  currentSessionId: null,
  isLoading: false,
  error: null,
};

function domainReducer(state: AiState, action: AiAction): AiState {
  switch (action.type) {
    case "AI_SESSION_SUCCESS":
      return {
        ...state,
        currentSessionId: action.payload.session_id,
        isLoading: false,
        error: null,
      };
    case "SEND_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
        isLoading: true,
      };
    case "AI_MESSAGE_SUCCESS":
      return {
        ...state,
        messages: [...state.messages, action.payload],
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
}

const reducer = withAsyncReducer<AiState, AiAction>(domainReducer as any, initialState);

export function AiProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const asyncActions = createAsyncActions(dispatch);

  const handleError = useCallback(
    (error: unknown, customMessage?: string) => {
      const errorMessage = error instanceof Error ? error.message : customMessage || "An unexpected AI error occurred";
      asyncActions.error(errorMessage);
      notify.error("AI Error", { message: errorMessage });
    },
    [asyncActions]
  );

  const createChatSession = useCallback(
    async (request: AiSessionCreate): Promise<AiSession | null> => {
      asyncActions.start();

      try {
        if (!request.event_id) {
          throw new Error("Event ID is required for creating a chat session");
        }

        const session = await AiService.createChatSession(request);

        if (session) {
          dispatch({
            type: "AI_SESSION_SUCCESS",
            payload: session,
          });
        }

        return session;
      } catch (error) {
        handleError(error, "Failed to create AI chat session");
        return null;
      }
    },
    [handleError]
  );

  const sendChatMessage = useCallback(
    async (request: AiMessagePayload): Promise<AiMessage | null> => {
      if (!state.currentSessionId) {
        handleError(null, "No active AI chat session");
        return null;
      }

      asyncActions.start();

      try {
        const data: AiMessage = {
          event_id: "",
          session_id: request.session_id,
          is_user_message: true,
          response: [request.message],
        };

        dispatch({
          type: "SEND_MESSAGE",
          payload: data,
        });

        const message = await AiService.sendChatMessage(request);

        if (message) {
          dispatch({
            type: "AI_MESSAGE_SUCCESS",
            payload: message,
          });
        }

        return message;
      } catch (error) {
        handleError(error, "Failed to send AI chat message");
        return null;
      }
    },
    [state.currentSessionId, handleError]
  );

  const generateEventDescription = useCallback(
    async (
      payload: AiEventDescriptionPayload
    ): Promise<AiEventDescription | null> => {
      asyncActions.start();

      try {
        const description = await AiService.generateEventDescription(payload);
        return description;
      } catch (error) {
        handleError(error, "Failed to generate event description");
        return null;
      }
    },
    [handleError]
  );

  const clearConversation = useCallback(() => {
    asyncActions.reset();
  }, [asyncActions]);

  const clearError = useCallback(() => {
    asyncActions.clearError();
  }, [asyncActions]);

  const contextValue = useMemo<AiContextType>(
    () => ({
      messages: state.messages,
      currentSessionId: state.currentSessionId,
      isLoading: state.isLoading,
      error: state.error,
      createChatSession,
      sendChatMessage,
      generateEventDescription,
      clearConversation,
      clearError,
    }),
    [
      state.messages,
      state.currentSessionId,
      state.isLoading,
      state.error,
      createChatSession,
      sendChatMessage,
      generateEventDescription,
      clearConversation,
      clearError,
    ]
  );

  return <AiContext.Provider value={contextValue}>{children}</AiContext.Provider>;
}
