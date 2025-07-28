import React, { useCallback, useState } from "react";
import AiContext from "../contexts/AiContext";
import { AiService } from "../services/aiService";
import {
  AiChatMessageRequest,
  AiChatMessageResponse,
  AiChatSessionCreateRequest,
  AiChatSessionCreateResponse,
  AiEventDescriptionResponse,
  AiMessage,
  AiResponse,
} from "../types/Ai";

type AiProviderProps = {
  children: React.ReactNode;
};

export const AiProvider: React.FC<AiProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [responses, setResponses] = useState<AiResponse[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setResponses([]);
    setCurrentSessionId(null);
    setError(null);
  }, []);

  const createChatSession = useCallback(
    async (
      request: AiChatSessionCreateRequest
    ): Promise<AiChatSessionCreateResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await AiService.createChatSession(request);

        // Validasi session ID
        if (!response.session_id) {
          const errorMsg = "Invalid session ID received from backend";
          console.error(errorMsg);
          setError(errorMsg);
          throw new Error(errorMsg);
        }

        // Set session ID
        setCurrentSessionId(response.session_id);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create chat session";

        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const sendChatMessage = useCallback(
    async (request: AiChatMessageRequest): Promise<AiChatMessageResponse> => {
      if (!currentSessionId) {
        throw new Error("No active chat session");
      }

      setIsLoading(true);
      setError(null);

      try {
        // Add user message
        const userMessage: AiMessage = {
          role: "user",
          content: request.message,
        };
        setMessages((prev) => [...prev, userMessage]);

        // Send message to AI service
        const response = await AiService.sendChatMessage(request);

        // Add AI response
        const aiMessage: AiMessage = {
          role: "assistant",
          content: response.response.join(" "),
        };
        setMessages((prev) => [...prev, aiMessage]);

        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send chat message";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentSessionId]
  );

  const generateEventDescription = useCallback(
    async (eventId: string): Promise<AiEventDescriptionResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        return await AiService.generateEventDescription(eventId);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to generate event description";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return (
    <AiContext.Provider
      value={{
        messages,
        responses,
        currentSessionId,
        isLoading,
        error,
        clearConversation,
        createChatSession,
        sendChatMessage,
        generateEventDescription,
      }}
    >
      {children}
    </AiContext.Provider>
  );
};
