import { EventContext, EventContextType } from "@/contexts/EventContext";
import { EventService } from "@/services/eventService";
import { parseError } from "@/types/AppError";
import { Event } from "@/types/Event";
import { showDialogError, showDialogSuccess } from "@/utils/alert";
import React, { ReactNode, useCallback, useReducer } from "react";

/**
 * Event state type for reducer
 */
interface EventState {
  event: Event | null;
  events: Event[];
  trendingEvents: Event[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Event action types for reducer
 */
type EventAction =
  | { type: "EVENT_START" }
  | { type: "EVENT_SUCCESS"; payload: Event[] }
  | { type: "TRENDING_EVENT_SUCCESS"; payload: Event[] }
  | { type: "EVENT_ERROR"; payload: string }
  | { type: "EVENT_CLEAR_ERROR" }
  | { type: "EVENT_RESET" }
  | { type: "SET_SINGLE_EVENT"; payload: Event | null };

/**
 * Initial event state
 */
const initialState: EventState = {
  events: [],
  event: null,
  trendingEvents: [],
  isLoading: false,
  error: null,
};

/**
 * Reducer function for event state management
 */
function eventReducer(state: EventState, action: EventAction): EventState {
  switch (action.type) {
    case "EVENT_START":
      return { ...state, isLoading: true, error: null };
    case "EVENT_SUCCESS":
      return {
        ...state,
        isLoading: false,
        events: action.payload,
        error: null,
      };
    case "TRENDING_EVENT_SUCCESS":
      return {
        ...state,
        isLoading: false,
        trendingEvents: action.payload,
        error: null,
      };
    case "EVENT_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "EVENT_CLEAR_ERROR":
      return { ...state, error: null };
    case "EVENT_RESET":
      return initialState;
    case "SET_SINGLE_EVENT":
      return { ...state, event: action.payload };
    default:
      return state;
  }
}

interface EventProviderProps {
  children: ReactNode;
}

export function EventProvider({ children }: EventProviderProps) {
  const [state, dispatch] = useReducer(eventReducer, initialState);

  /**
   * Handle any API errors
   */
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const appError = parseError(error);
    const errorMessage = customMessage || appError.message;

    dispatch({ type: "EVENT_ERROR", payload: errorMessage });
    showDialogError("Error", errorMessage);
  }, []);

  /**
   * Fetch events with optional filters
   */
  const fetchEvents = useCallback(
    async (filters?: {
      cityId?: string;
      provinceId?: string;
      isKidFriendly?: boolean;
    }) => {
      dispatch({ type: "EVENT_START" });

      try {
        const response = await EventService.fetchEvents();

        dispatch({
          type: "EVENT_SUCCESS",
          payload: response,
        });
      } catch (error) {
        handleError(error, "Gagal mengambil daftar event");
      }
    },
    [handleError]
  );

  /**
   * Fetch trending events
   */
  const fetchTrendingEvents = useCallback(async () => {
    dispatch({ type: "EVENT_START" });

    try {
      const response = await EventService.fetchTrendingEvents();

      dispatch({
        type: "TRENDING_EVENT_SUCCESS",
        payload: response,
      });
    } catch (error) {
      handleError(error, "Gagal mengambil daftar trending event");
    }
  }, [handleError]);

  /**
   * Create a new event
   */
  const createEvent = useCallback(
    async (eventData: Partial<Event>) => {
      dispatch({ type: "EVENT_START" });

      try {
        const response = await EventService.createEvent(eventData);

        // Optimistically update local state
        dispatch({
          type: "EVENT_SUCCESS",
          payload: response ? [...state.events, response] : state.events,
        });

        showDialogSuccess("Berhasil", "Event berhasil dibuat");
        return true;
      } catch (error) {
        handleError(error, "Gagal membuat event");
        return false;
      }
    },
    [handleError, state.events]
  );

  /**
   * Update an existing event
   */
  const updateEvent = useCallback(
    async (eventId: string, eventData: Partial<Event>) => {
      dispatch({ type: "EVENT_START" });

      try {
        const response = await EventService.updateEvent(eventId, eventData);

        // Optimistically update local state
        dispatch({
          type: "EVENT_SUCCESS",
          payload: state.events.map((event) =>
            event.id === eventId ? { ...event, ...response } : event
          ),
        });

        showDialogSuccess("Berhasil", "Event berhasil diperbarui");
        return true;
      } catch (error) {
        handleError(error, "Gagal memperbarui event");
        return false;
      }
    },
    [handleError, state.events]
  );

  /**
   * Delete an event
   */
  const deleteEvent = useCallback(
    async (eventId: string) => {
      dispatch({ type: "EVENT_START" });

      try {
        await EventService.deleteEvent(eventId);

        // Optimistically update local state
        dispatch({
          type: "EVENT_SUCCESS",
          payload: state.events.filter((event) => event.id !== eventId),
        });

        showDialogSuccess("Berhasil", "Event berhasil dihapus");
        return true;
      } catch (error) {
        handleError(error, "Gagal menghapus event");
        return false;
      }
    },
    [handleError, state.events]
  );

  /**
   * Get event by ID
   */
  const getEventById = useCallback(
    async (eventId: string) => {
      const foundEvent = state.events.find((event) => event.id === eventId);

      dispatch({
        type: "SET_SINGLE_EVENT",
        payload: foundEvent || null,
      });
      return foundEvent;
    },
    [state.events]
  );

  /**
   * Get event by name
   */
  const getEventByName = useCallback(
    async (eventName: string): Promise<Event | null> => {
      const foundEvent = state.events.find((event) =>
        event.name.toLowerCase().includes(eventName.toLowerCase())
      );

      // Update the single event state
      dispatch({
        type: "SET_SINGLE_EVENT",
        payload: foundEvent || null,
      });

      return foundEvent || null;
    },
    [state.events]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    dispatch({ type: "EVENT_CLEAR_ERROR" });
  }, []);

  /**
   * Context value
   */
  const value: EventContextType = {
    events: state.events,
    event: state.event,
    trendingEvents: state.trendingEvents,
    isLoading: state.isLoading,
    error: state.error,
    fetchEvents,
    fetchTrendingEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    getEventByName,
    clearError,
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}
