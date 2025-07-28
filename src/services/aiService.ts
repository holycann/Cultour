import {
    AiChatMessageRequest,
    AiChatMessageResponse,
    AiChatSessionCreateRequest,
    AiChatSessionCreateResponse,
    AiEventDescriptionResponse,
    AiResponse
} from "../types/Ai";
import { BaseApiService } from "./baseApiService";

/**
 * AI service for managing AI-related API operations
 */
export class AiService extends BaseApiService {
  /**
   * Fetch conversation history
   * @returns Promise resolving to array of AI responses
   */
  static async getConversationHistory(): Promise<AiResponse[]> {
    try {
      const response = await this.get<AiResponse[]>("/ai/history");
      return response.data || [];
    } catch (error) {
      console.error("AI History Error:", error);
      throw error;
    }
  }

  /**
   * Create a new AI chat session
   * @param request Chat session creation request
   * @returns Promise resolving to chat session ID
   */
  static async createChatSession(
    request: AiChatSessionCreateRequest
  ): Promise<AiChatSessionCreateResponse> {
    try {
      const response = await this.post<
        AiChatSessionCreateRequest,
        AiChatSessionCreateResponse
      >("/ai/chat/session", request);
      return response.data || { session_id: "" };
    } catch (error) {
      console.error("AI Chat Session Creation Error:", error);
      throw error;
    }
  }

  /**
   * Send a message in an AI chat session
   * @param sessionId Chat session ID
   * @param request Message request
   * @returns Promise resolving to AI chat message response
   */
  static async sendChatMessage(
    sessionId: string,
    request: AiChatMessageRequest
  ): Promise<AiChatMessageResponse> {
    try {
      const response = await this.post<
        AiChatMessageRequest,
        AiChatMessageResponse
      >(`/ai/chat/${sessionId}/message`, request);
      return response.data || { response: [] };
    } catch (error) {
      console.error("AI Chat Message Error:", error);
      throw error;
    }
  }

  /**
   * Generate an AI event description
   * @param eventId Event ID
   * @returns Promise resolving to event description
   */
  static async generateEventDescription(
    eventId: string
  ): Promise<AiEventDescriptionResponse> {
    try {
      const response = await this.get<AiEventDescriptionResponse>(
        `/ai/event/${eventId}/description`
      );
      return response.data || { description: "" };
    } catch (error) {
      console.error("AI Event Description Generation Error:", error);
      throw error;
    }
  }
}

export const aiService = new AiService();
