import { ApiResponse, isApiResponse } from "@/types/ApiResponse";
import { Event } from "@/types/Event";
import { BaseApiService } from "./baseApiService";

/**
 * Event service for managing event-related API operations
 */
export class EventService extends BaseApiService {
  /**
   * Fetch events with optional filters
   */
  static async fetchEvents(filters?: {
    cityId?: string;
    provinceId?: string;
    isKidFriendly?: boolean;
  }): Promise<Event[]> {
    try {
      const response = await this.get<ApiResponse<Event[]>>("/events", {
        params: filters,
      });

      // Type guard to ensure we return an array of events
      if (isApiResponse<Event[]>(response) && response.data) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error("Failed to fetch events:", error);
      return [];
    }
  }

  /**
   * Search events by query
   * @param query Search query string
   * @param options Optional search options
   */
  static async searchEvents(
    query: string,
    options?: {
      limit?: number;
      cityId?: string;
      provinceId?: string;
    }
  ): Promise<Event[]> {
    try {
      const response = await this.get<ApiResponse<Event[]>>("/events/search", {
        params: {
          query,
          limit: options?.limit || 5,
          cityId: options?.cityId,
          provinceId: options?.provinceId,
        },
      });

      // Type guard to ensure we return an array of events
      if (isApiResponse<Event[]>(response) && response.data) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error("Failed to search events:", error);
      return [];
    }
  }

  /**
   * Fetch trending events
   * @returns Promise resolving to array of trending events
   */
  static async fetchTrendingEvents(): Promise<Event[]> {
    try {
      const response = await this.get<Event[]>("/events/trending");

      console.log('Trending Events:', JSON.stringify(response, null, 2));

      if (!response.success) {
        console.log("Error Trending:", response);
        throw new Error(response.error || "Failed to fetch trending events");
      }

      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch trending events:", error);
      throw error;
    }
  }

  /**
   * Fetch events by city
   * @param cityId City's unique identifier
   * @returns Promise resolving to array of events
   */
  static async fetchEventsByCity(cityId: string): Promise<Event[]> {
    try {
      const response = await this.get<Event[]>(`/cities/${cityId}/events`);

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch events by city");
      }

      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch events by city:", error);
      throw error;
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

      if (!response.success) {
        throw new Error(response.error || "Failed to get event by ID");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to get event by ID:", error);
      throw error;
    }
  }

  /**
   * Create a new event
   * @param eventData Event data to create
   * @returns Promise resolving to the created event
   */
  static async createEvent(eventData: Partial<Event>): Promise<Event> {
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
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;
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

      if (!response.success) {
        throw new Error(response.error || "Failed to create event");
      }

      if (!response.data) {
        throw new Error("No event data returned");
      }

      return response.data;
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
    eventId: string,
    eventData: Partial<Event>
  ): Promise<Event> {
    try {
      const response = await this.put<Partial<Event>, Event>(
        `/events/${eventId}`,
        eventData
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to update event");
      }

      if (!response.data) {
        throw new Error("No updated event data returned");
      }

      return response.data;
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
        throw new Error(response.error || "Failed to delete event");
      }

      return true;
    } catch (error) {
      console.error("Failed to delete event:", error);
      throw error;
    }
  }

  /**
   * Fetch events by user
   * @param userId User's unique identifier
   * @returns Promise resolving to array of events
   */
  static async fetchEventsByUser(userId: string): Promise<Event[]> {
    try {
      const response = await this.get<Event[]>(`/users/${userId}/events`);

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch events by user");
      }

      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch events by user:", error);
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
        throw new Error(response.error || "Failed to update event views");
      }
    } catch (error) {
      console.error("Failed to update event views:", error);
      throw error;
    }
  }
}
