import {
  AiEventDescription,
  AiEventDescriptionPayload,
  AiMessage,
  AiMessagePayload,
  AiSession,
  AiSessionCreate,
} from "@/types/Ai";
import { BaseApiService } from "./baseApiService";

/**
 * AI service for managing AI-related API operations
 */
export class AiService extends BaseApiService {
  /**
   * Create a new AI chat session
   */
  static async createChatSession(
    request: AiSessionCreate
  ): Promise<AiSession | null> {
    try {
      const response = await this.post<AiSessionCreate, AiSession>(
        "/ai/chat/session",
        request
      );

      return this.handleApiResponse<AiSession>(response, true).data;
    } catch (error) {
      console.error("Failed to create ai session", error);
      throw error;
    }
  }

  /**
   * Send a message in an AI chat session
   */
  static async sendChatMessage(
    request: AiMessagePayload
  ): Promise<AiMessage | null> {
    try {
      const response = await this.post<AiMessagePayload, AiMessage>(
        `/ai/chat/${request.session_id}/message`,
        request
      );

      if (response.data) {
        response.data.session_id = request.session_id;
        response.data.is_user_message = false;
      }

      return this.handleApiResponse<AiMessage>(response, true).data;
    } catch (error) {
      console.error("Failed to send message to ai:", error);
      throw error;
    }
  }

  /**
   * Generate an AI event description (title/context-based)
   */
  static async generateEventDescription(
    payload: AiEventDescriptionPayload
  ): Promise<AiEventDescription | null> {
    try {
      const response = await this.post<
        AiEventDescriptionPayload,
        AiEventDescription
      >("/ai/events/description", payload);

      return this.handleApiResponse<AiEventDescription>(response, true).data;
    } catch (error) {
      console.error("Failed generate event description:", error);
      throw error;
    }
  }
}

export const aiService = new AiService();
