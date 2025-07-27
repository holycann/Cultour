import { Thread, ThreadCreateData, ThreadJoinData, ThreadUpdateData } from "@/types/Thread";
import { BaseApiService } from "./baseApiService";

/**
 * Thread service for managing thread-related API operations
 */
export class ThreadService extends BaseApiService {
  /**
   * Get thread by event ID
   * @param eventId Event's unique identifier
   * @returns Promise resolving to thread or null
   */
  static async getThreadByEventId(eventId: string): Promise<Thread | null> {
    try {
      const response = await this.get<Thread>(`/threads/event/${eventId}`);

      if (!response.success) {
        // If no thread exists, return null (not an error)
        if (response.error?.includes('Thread not found')) {
          return null;
        }
        throw new Error(response.error || "Failed to get thread");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to get thread by event ID:", error);
      throw error;
    }
  }

  /**
   * Create a new event thread
   * @param threadData Thread creation data
   * @returns Promise resolving to created thread or null
   */
  static async createEventThread(threadData: ThreadCreateData): Promise<Thread | null> {
    try {
      const response = await this.post<ThreadCreateData, Thread>(
        "/threads",
        threadData
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to create event thread");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to create event thread:", error);
      throw error;
    }
  }

  /**
   * Join an existing event thread
   * @param joinData Thread join data
   * @returns Promise resolving to updated thread or null
   */
  static async joinEventThread(joinData: ThreadJoinData): Promise<Thread | null> {
    try {
      const response = await this.post<ThreadJoinData, Thread>(
        `/threads/${joinData.thread_id}/join`,
        joinData
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to join event thread");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to join event thread:", error);
      throw error;
    }
  }

  /**
   * Update an existing thread
   * @param threadId Thread's unique identifier
   * @param threadData Thread update data
   * @returns Promise resolving to updated thread or null
   */
  static async updateThread(
    threadId: string, 
    threadData: ThreadUpdateData
  ): Promise<Thread | null> {
    try {
      const response = await this.put<ThreadUpdateData, Thread>(
        `/threads/${threadId}`,
        threadData
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to update thread");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to update thread:", error);
      throw error;
    }
  }
}
