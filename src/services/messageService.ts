import { AiChatMessage, DiscussionMessage } from "@/types/Message";
import { BaseApiService } from "./baseApiService";

/**
 * Message service for managing message-related API operations
 */
export class MessageService extends BaseApiService {
  /**
   * Ask AI about a specific event
   * @param eventId Event's unique identifier
   * @param query User's query about the event
   * @returns Promise resolving to AI chat message or null
   */
  static async askAiAboutEvent(
    eventId: string,
    query: string
  ): Promise<AiChatMessage | null> {
    try {
      const response = await this.post<
        { event_id: string; query: string },
        AiChatMessage
      >(`/ask/event/${eventId}`, {
        event_id: eventId,
        query: query,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to get AI response");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to ask AI about event:", error);
      throw error;
    }
  }

  /**
   * Send a discussion message in a thread
   * @param threadId Thread identifier
   * @param content Message content
   * @returns Promise resolving to discussion message or null
   */
  static async sendDiscussionMessage(
    threadId: string,
    content: string
  ): Promise<DiscussionMessage | null> {
    try {
      const response = await this.post<
        { thread_id: string; content: string },
        DiscussionMessage
      >("/messages", { thread_id: threadId, content });

      if (!response.success) {
        throw new Error(response.error || "Failed to send discussion message");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to send discussion message:", error);
      throw error;
    }
  }

  /**
   * Fetch messages for a specific thread
   * @param threadId Thread identifier
   * @returns Promise resolving to list of discussion messages
   */
  static async fetchThreadMessages(
    threadId: string
  ): Promise<DiscussionMessage[]> {
    try {
      const response = await this.get<DiscussionMessage[]>(
        `/threads/${threadId}/messages`
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch thread messages");
      }

      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch thread messages:", error);
      throw error;
    }
  }
}
