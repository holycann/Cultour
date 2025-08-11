import { Pagination, Sorting } from "@/types/ApiResponse";
import { Event, EventCreate, EventOptions, EventUpdate } from "@/types/Event";
import { createContext } from "react";

/**
 * Event context type definition with enhanced methods and error handling
 */
export interface EventContextType {
  event: Event | null;
  events: Event[];
  trendingEvents: Event[];
  isLoading: boolean;
  error: string | null;

  // Event Fetching Methods
  fetchEvents: (options?: {
    eventOptions?: EventOptions;
    pagination?: Pagination;
    sorting?: Sorting;
  }) => Promise<Event[] | null>;

  searchEvents: (
    query: string, 
    options?: {
      eventOptions?: EventOptions;
      pagination?: Pagination;
    }
  ) => Promise<Event[] | null>;

  fetchTrendingEvents: (options?: {
    eventOptions?: EventOptions;
    pagination?: Pagination;
    sorting?: Sorting;
  }) => Promise<Event[] | null>;

  fetchRelatedEvents: (
    eventId: string,
    options?: {
      eventOptions?: EventOptions;
      pagination?: Pagination;
    }
  ) => Promise<Event[] | null>;

  // Event CRUD Operations
  createEvent: (eventData: EventCreate) => Promise<Event | null>;
  updateEvent: (eventData: EventUpdate) => Promise<Event | null>;
  deleteEvent: (eventId: string) => Promise<boolean>;

  // Event Lookup Methods
  getEventById: (eventId: string) => Promise<Event | null>;
  getEventByName: (eventName: string) => Promise<Event | null>;
  updateEventViews: (eventId: string) => Promise<boolean>;

  // State Management Methods
  clearError: () => void;
  resetEventState: () => void;
}

/**
 * Create the context with an undefined default value
 */
export const EventContext = createContext<EventContextType | undefined>(
  undefined
);
