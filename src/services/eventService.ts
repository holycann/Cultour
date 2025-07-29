import { Event } from "@/types/Event";
import { BaseApiService } from './baseApiService';

/**
 * Event service for managing event-related API operations
 */
export class EventService extends BaseApiService {
  /**
   * Fetch all events
   * @returns Promise resolving to array of events
   */
  static async fetchEvents(): Promise<Event[]> {
    try {
      const response = await this.get<Event[]>('/events');
      
      if (!response.success) {
        console.log("Error Events:", response);
        throw new Error(response.error || 'Failed to fetch events');
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch events:", error);
      throw error;
    }
  }

  /**
   * Fetch trending events
   * @returns Promise resolving to array of trending events
   */
  static async fetchTrendingEvents(): Promise<Event[]> {
    try {
      const response = await this.get<Event[]>('/events/trending');

      if (!response.success) {
        console.log("Error Trending:", response);
        throw new Error(response.error || 'Failed to fetch trending events');
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
        throw new Error(response.error || 'Failed to fetch events by city');
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
        throw new Error(response.error || 'Failed to get event by ID');
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
      const response = await this.post<Partial<Event>, Event>('/events', eventData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create event');
      }
      
      if (!response.data) {
        throw new Error('No event data returned');
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
      const response = await this.put<Partial<Event>, Event>(`/events/${eventId}`, eventData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update event');
      }
      
      if (!response.data) {
        throw new Error('No updated event data returned');
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
        throw new Error(response.error || 'Failed to delete event');
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
        throw new Error(response.error || 'Failed to fetch events by user');
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch events by user:", error);
      throw error;
    }
  }
} 