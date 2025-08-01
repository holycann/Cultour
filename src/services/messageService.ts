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
   * Update a discussion message
   * @param messageId Message identifier
   * @param content Updated message content
   * @returns Promise resolving to updated discussion message or null
   */
  static async updateDiscussionMessage(
    messageId: string,
    content: string
  ): Promise<DiscussionMessage | null> {
    try {
      const response = await this.put<
        { content: string },
        DiscussionMessage
      >(`/messages/${messageId}`, { content });

      if (!response.success) {
        throw new Error(response.error || "Failed to update discussion message");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to update discussion message:", error);
      throw error;
    }
  }

  /**
   * Delete a discussion message
   * @param messageId Message identifier
   * @returns Promise resolving to boolean indicating success
   */
  static async deleteDiscussionMessage(
    messageId: string
  ): Promise<boolean> {
    try {
      const response = await this.delete<void>(`/messages/${messageId}`);

      if (!response.success) {
        throw new Error(response.error || "Failed to delete discussion message");
      }

      return true;
    } catch (error) {
      console.error("Failed to delete discussion message:", error);
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
      const response = await this.get<(DiscussionMessage & { user_id: string })[]>(
        `/messages/thread/${threadId}`
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch thread messages");
      }

      return (response.data || []).map(message => ({
        ...message,
        sender_id: message.user_id
      }));
    } catch (error) {
      console.error("Failed to fetch thread messages:", error);
      throw error;
    }
  }
}
