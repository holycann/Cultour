import { ApiResponse } from "@/types/ApiResponse";
import {
  Thread,
  ThreadCreateData,
  ThreadJoinData,
  ThreadParticipant,
} from "@/types/Thread";
import { BaseApiService } from "./baseApiService";

/**
 * Thread service for managing thread-related API operations
 * Responsible for handling thread API requests and responses
 */
export class ThreadService extends BaseApiService {
  /**
   * Get thread by event ID
   * @param eventId Event's unique identifier
   * @returns Promise resolving to ApiResponse<Thread>
   */
  static async getThreadByEventId(
    eventId: string
  ): Promise<ApiResponse<Thread>> {
    try {
      const response = await this.get<Thread>(`/threads/event/${eventId}`);

      return this.handleApiResponse<Thread>(response, true);
    } catch (error) {
      console.error("Failed to get thread by event ID:", error);
      throw error;
    }
  }

  /**
   * Create a new event thread
   * @param threadData Thread creation data
   * @returns Promise resolving to ApiResponse<Thread>
   */
  static async createEventThread(
    threadData: ThreadCreateData
  ): Promise<ApiResponse<Thread>> {
    try {
      const response = await this.post<ThreadCreateData, Thread>(
        "/threads",
        threadData
      );

      return this.handleApiResponse<Thread>(response, true);
    } catch (error) {
      console.error("Failed to create event thread:", error);
      throw error;
    }
  }

  /**
   * Join an existing event thread
   * @param joinData Thread join data
   * @returns Promise resolving to ApiResponse<Thread>
   */
  static async joinEventThread(
    joinData: ThreadJoinData
  ): Promise<ApiResponse<ThreadParticipant>> {
    try {
      const response = await this.post<ThreadJoinData, ThreadParticipant>(
        `/threads/${joinData.thread_id}/join`
      );

      return this.handleApiResponse<ThreadParticipant>(response, true);
    } catch (error) {
      console.error("Failed to join event thread:", error);
      throw error;
    }
  }
}
