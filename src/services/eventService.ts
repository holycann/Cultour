import { ApiResponse, Pagination, Sorting } from "@/types/ApiResponse";
import { Event, EventCreate, EventOptions, EventUpdate } from "@/types/Event";
import { BaseApiService } from "./baseApiService";

/**
 * Event service for managing event-related API operations
 */
export class EventService extends BaseApiService {
  /**
   * Fetch events with optional filters and pagination
   */
  static async fetchEvents(
    options?: EventOptions,
    pagination?: Pagination,
    sort?: Sorting
  ): Promise<ApiResponse<Event[]>> {
    try {
      const response = await this.get<Event[]>("/events", {
        params: {
          options,
          ...(pagination ?? BaseApiService.defaultParams.pagination),
          ...(sort ?? BaseApiService.defaultParams.sorting),
        },
      });

      return this.handleApiResponse<Event[]>(response, false);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Fetch trending events
   * @returns Promise resolving to array of trending events
   */
  static async fetchTrendingEvents(
    options?: EventOptions,
    pagination?: Pagination,
    sort?: Sorting
  ): Promise<ApiResponse<Event[]>> {
    try {
      const response = await this.get<Event[]>("/events", {
        params: {
          options,
          ...(pagination ?? BaseApiService.defaultParams.pagination),
          ...(sort ?? BaseApiService.defaultParams.sorting),
        },
      });

      return this.handleApiResponse<Event[]>(response, false);
    } catch (error) {
      console.error("Failed to fetch trending events:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Search events by query
   */
  static async searchEvents(
    query: string,
    options?: EventOptions,
    pagination?: Pagination
  ): Promise<ApiResponse<Event[]>> {
    try {
      const response = await this.get<Event[]>("/events/search", {
        params: {
          query,
          options,
          pagination,
        },
      });

      return this.handleApiResponse<Event[]>(response, false);
    } catch (error) {
      console.error("Failed to search events:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get event by ID
   * @param eventId Event's unique identifier
   * @returns Promise resolving to an event or null
   */
  static async getEventById(eventId: string): Promise<Event | null> {
    try {
      const response = await this.get<Event>(`/events/${eventId}`);

      return this.handleApiResponse<Event>(response, true).data;
    } catch (error) {
      console.error("Failed to get event by ID:", error);
      throw error;
    }
  }

  /**
   * Get related events by base event and optional location
   */
  static async getRelatedEvents(
    eventId: string,
    options?: EventOptions,
    pagination?: Pagination,
    sort?: Sorting
  ): Promise<ApiResponse<Event[]>> {
    try {
      const response = await this.get<Event[]>(`/events/${eventId}/related`, {
        params: {
          options,
          ...(pagination ?? BaseApiService.defaultParams.pagination),
          ...(sort ?? BaseApiService.defaultParams.sorting),
        },
      });

      return this.handleApiResponse<Event[]>(response, false);
    } catch (error) {
      console.error("Failed to fetch related events:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create a new event
   * @param eventData Event data to create
   * @returns Promise resolving to the created event
   */
  static async createEvent(eventData: EventCreate): Promise<Event | null> {
    try {
      const formData = new FormData();

      Object.entries(eventData).forEach(([key, value]) => {
        if (key === "image" && Array.isArray(value) && value[0]) {
          // Only support single image for now
          const image = value[0];
          if (typeof image === "string") {
            // Try to guess filename and type
            const uri = image;
            const filename = uri.split("/").pop() || "image.jpg";
            const match = /(\.\w+)$/.exec(filename);
            const type = match ? `image/${match[1].slice(1)}` : `image`;
            formData.append("image", {
              uri,
              name: filename,
              type,
            } as any);
          } else {
            // If already a File/Blob
            formData.append("image", image);
          }
        } else if (value !== undefined && value !== null) {
          if (typeof value === "object" && !Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value as any);
          }
        }
      });

      const response = await this.post<FormData, Event>("/events", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return this.handleApiResponse<Event>(response, true).data;
    } catch (error) {
      console.error("Failed to create event:", error);
      throw error;
    }
  }

  /**
   * Update an existing event
   * @param eventId Event's unique identifier
   * @param eventData Event data to update
   * @returns Promise resolving to the updated event
   */
  static async updateEvent(
    eventData: EventUpdate
  ): Promise<Event | null> {
    try {
      const formData = new FormData();

      Object.entries(eventData).forEach(([key, value]) => {
        if (key === "image" && Array.isArray(value) && value[0]) {
          // Only support single image for now
          const image = value[0];
          if (typeof image === "string") {
            // Try to guess filename and type
            const uri = image;
            const filename = uri.split("/").pop() || "image.jpg";
            const match = /(\.\w+)$/.exec(filename);
            const type = match ? `image/${match[1].slice(1)}}` : `image`;
            formData.append("image", {
              uri,
              name: filename,
              type,
            } as any);
          } else {
            // If already a File/Blob
            formData.append("image", image);
          }
        } else if (value !== undefined && value !== null) {
          if (typeof value === "object" && !Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value as any);
          }
        }
      });

      const response = await this.put<FormData, Event>(
        `/events/${eventData.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return this.handleApiResponse<Event>(response, true).data;
    } catch (error) {
      console.error("Failed to update event:", error);
      throw error;
    }
  }

  /**
   * Delete an event
   * @param eventId Event's unique identifier
   * @returns Promise resolving to the deletion result
   */
  static async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const response = await this.delete(`/events/${eventId}`);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete event");
      }

      return true;
    } catch (error) {
      console.error("Failed to delete event:", error);
      throw error;
    }
  }

  /**
   * Update event views
   * @param eventId Event's unique identifier
   * @returns Promise resolving to the update result
   */
  static async updateEventViews(eventId: string): Promise<void> {
    try {
      const response = await this.post(`/events/${eventId}/views`);

      if (!response.success) {
        throw new Error(response.message || "Failed to update event views");
      }
    } catch (error) {
      console.error("Failed to update event views:", error);
      throw error;
    }
  }
}
