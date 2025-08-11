import { createContext } from "react";
import {
  AiEventDescription,
  AiEventDescriptionPayload,
  AiMessage,
  AiMessagePayload,
  AiSession,
  AiSessionCreate,
} from "../types/Ai";

export interface AiContextType {
  messages: AiMessage[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;

  // Session Management
  createChatSession: (request: AiSessionCreate) => Promise<AiSession | null>;

  // Message Management
  sendChatMessage: (request: AiMessagePayload) => Promise<AiMessage | null>;

  // Event Description Generation
  generateEventDescription: (
    payload: AiEventDescriptionPayload
  ) => Promise<AiEventDescription | null>;

  // State Management
  clearConversation: () => void;
  clearError: () => void;
}

const AiContext = createContext<AiContextType>({
  messages: [],
  currentSessionId: null,
  isLoading: false,
  error: null,

  createChatSession: async () => null,
  sendChatMessage: async () => null,
  generateEventDescription: async () => null,
  clearConversation: () => {},
  clearError: () => {},
});

export default AiContext;
