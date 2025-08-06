import {
  Thread,
  ThreadCreateData,
  ThreadJoinData,
  ThreadUpdateData,
} from "@/types/Thread";
import { BaseApiService } from "./baseApiService";

/**
 * Result type for thread operations
 */
export interface ThreadResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

/**
 * Thread service for managing thread-related API operations
 * Responsible for handling thread API requests and responses
 */
export class ThreadService extends BaseApiService {
  /**
   * Get thread by event ID
   * @param eventId Event's unique identifier
   * @returns Promise resolving to ThreadResult
   */
  static async getThreadByEventId(eventId: string): Promise<ThreadResult<Thread>> {
    try {
      const response = await this.get<Thread>(`/threads/event/${eventId}`);

      if (!response.success) {
        // If no thread exists, return success=true but data=null (not an error)
        if (response.error?.includes("Thread not found")) {
          return {
            success: true,
            data: null,
          };
        }
        
        return {
          success: false,
          data: null,
          error: response.error || "Failed to get thread",
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to get thread by event ID:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Create a new event thread
   * @param threadData Thread creation data
   * @returns Promise resolving to ThreadResult
   */
  static async createEventThread(
    threadData: ThreadCreateData
  ): Promise<ThreadResult<Thread>> {
    try {
      const response = await this.post<ThreadCreateData, Thread>(
        "/threads",
        threadData
      );

      if (!response.success) {
        return {
          success: false,
          data: null,
          error: response.error || "Failed to create event thread",
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to create event thread:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Join an existing event thread
   * @param joinData Thread join data
   * @returns Promise resolving to ThreadResult
   */
  static async joinEventThread(
    joinData: ThreadJoinData
  ): Promise<ThreadResult<Thread>> {
    try {
      const response = await this.post<ThreadJoinData, Thread>(
        `/threads/${joinData.thread_id}/join?event_id=${joinData.event_id}`
      );

      if (!response.success) {
        return {
          success: false,
          data: null,
          error: response.error || "Failed to join event thread",
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to join event thread:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Update an existing thread
   * @param threadId Thread's unique identifier
   * @param threadData Thread update data
   * @returns Promise resolving to ThreadResult
   */
  static async updateThread(
    threadId: string,
    threadData: ThreadUpdateData
  ): Promise<ThreadResult<Thread>> {
    try {
      const response = await this.put<ThreadUpdateData, Thread>(
        `/threads/${threadId}`,
        threadData
      );

      if (!response.success) {
        return {
          success: false,
          data: null,
          error: response.error || "Failed to update thread",
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Failed to update thread:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
