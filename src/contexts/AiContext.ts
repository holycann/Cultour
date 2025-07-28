import { createContext } from "react";
import {
  AiChatMessageRequest,
  AiChatMessageResponse,
  AiChatSessionCreateRequest,
  AiChatSessionCreateResponse,
  AiEventDescriptionResponse,
  AiMessage,
  AiResponse,
} from "../types/Ai";

type AiContextType = {
  messages: AiMessage[];
  responses: AiResponse[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;

  // Existing methods
  clearConversation: () => void;

  // New methods
  createChatSession: (
    request: AiChatSessionCreateRequest
  ) => Promise<AiChatSessionCreateResponse>;
  sendChatMessage: (
    request: AiChatMessageRequest
  ) => Promise<AiChatMessageResponse>;
  generateEventDescription: (
    eventId: string
  ) => Promise<AiEventDescriptionResponse>;
};

const AiContext = createContext<AiContextType>({
  messages: [],
  responses: [],
  currentSessionId: null,
  isLoading: false,
  error: null,

  clearConversation: () => {},

  createChatSession: async () => ({ session_id: "" }),
  sendChatMessage: async () => ({ response: [] }),
  generateEventDescription: async () => ({ description: "" }),
});

export default AiContext;
