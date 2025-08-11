import { ApiResponse } from "@/types/ApiResponse";
import {
  Message,
  SendDiscussionMessage,
  UpdateDiscussionMessage,
} from "@/types/Message";
import { BaseApiService } from "./baseApiService";

export class MessageService extends BaseApiService {
  /**
   * List messages (requires auth)
   */
  static async fetchMessagesByThread(
    threadID: string
  ): Promise<ApiResponse<Message[]>> {
    try {
      const response = await this.get<Message[]>(
        `/messages/thread/${threadID}`
      );

      return this.handleApiResponse<Message[]>(response, false);
    } catch (error) {
      console.error("Failed to list messages:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send a discussion message in a thread
   * @param threadId Thread identifier
   * @param content Message content
   * @returns Promise resolving to discussion message or null
   */
  static async sendDiscussionMessage(
    payload: SendDiscussionMessage
  ): Promise<Message | null> {
    try {
      // Validate input
      if (!payload.thread_id || !payload.content.trim()) {
        console.error("Invalid message parameters");
        return null;
      }

      const response = await this.post<SendDiscussionMessage, Message>(
        `/messages`,
        {
          thread_id: payload.thread_id,
          content: payload.content.trim(),
        }
      );

      return this.handleApiResponse<Message>(response, true).data;
    } catch (error) {
      console.error("Error sending discussion message:", error);
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
    payload: UpdateDiscussionMessage
  ): Promise<Message | null> {
    try {
      const response = await this.put<UpdateDiscussionMessage, Message>(
        `/messages/${payload.id}`
      );

      return this.handleApiResponse<Message>(response, true).data;
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
  static async deleteDiscussionMessage(messageId: string): Promise<boolean> {
    try {
      const response = await this.delete<void>(`/messages/${messageId}`);

      if (!response.success) {
        throw new Error(
          response.message || "Failed to delete discussion message"
        );
      }

      return true;
    } catch (error) {
      console.error("Failed to delete discussion message:", error);
      throw error;
    }
  }
}
