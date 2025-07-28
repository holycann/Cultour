import { Event } from "@/types/Event";
import { createContext } from "react";

/**
 * Event context type definition
 */
export interface EventContextType {
  event: Event | null;
  events: Event[];
  trendingEvents: Event[];
  isLoading: boolean;
  error: string | null;
  fetchEvents: (filters?: {
    cityId?: string;
    provinceId?: string;
    isKidFriendly?: boolean;
  }) => Promise<void>;
  fetchTrendingEvents: () => Promise<void>;
  createEvent: (eventData: Partial<Event>) => Promise<boolean>;
  updateEvent: (eventId: string, eventData: Partial<Event>) => Promise<boolean>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  getEventById: (eventId: string) => Promise<Event | undefined>;
  getEventByName: (eventName: string) => Promise<Event | null>;
  clearError: () => void;
}

/**
 * Create the context with a undefined default value
 */
export const EventContext = createContext<EventContextType | undefined>(
  undefined
);
