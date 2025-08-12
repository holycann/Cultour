import { EventContext, EventContextType } from "@/contexts/EventContext";
import { EventService } from "@/services/eventService";
import notify from "@/services/notificationService";
import { Pagination, Sorting } from "@/types/ApiResponse";
import { Event, EventCreate, EventOptions, EventUpdate } from "@/types/Event";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";
import { createAsyncActions, withAsyncReducer } from "./asyncFactory";

type EventState = {
  selectedEvent: Event | null;
  allEvents: Event[];
  trendingEvents: Event[];
  isLoading: boolean;
  error: string | null;
};

type EventAction =
  | { type: "EVENT_SUCCESS"; payload: Event[] }
  | { type: "TRENDING_EVENT_SUCCESS"; payload: Event[] }
  | { type: "SET_SINGLE_EVENT"; payload: Event | null };

const initialState: EventState = {
  selectedEvent: null,
  allEvents: [],
  trendingEvents: [],
  isLoading: false,
  error: null,
};

function domainReducer(
  state: EventState,
  action:
    | EventAction
    | ReturnType<typeof createAsyncActions>[keyof ReturnType<
        typeof createAsyncActions
      >] extends never
    ? never
    : any
): EventState {
  switch (action.type) {
    case "EVENT_SUCCESS":
      return {
        ...state,
        isLoading: false,
        allEvents: action.payload,
        error: null,
      };
    case "TRENDING_EVENT_SUCCESS":
      return {
        ...state,
        isLoading: false,
        trendingEvents: action.payload,
        error: null,
      };
    case "SET_SINGLE_EVENT":
      return { ...state, selectedEvent: action.payload };
    default:
      return state;
  }
}

const reducer = withAsyncReducer<EventState, EventAction>(
  domainReducer as any,
  initialState
);

export function EventProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const asyncActions = createAsyncActions(dispatch);

  const handleError = useCallback(
    (error: unknown, customMessage?: string) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : customMessage || "An unexpected event error occurred";
      asyncActions.error(errorMessage);
      notify.error("Event Error", { message: errorMessage });
    },
    [asyncActions]
  );

  const fetchEvents = useCallback(
    async (options?: {
      eventOptions?: EventOptions;
      pagination?: Pagination;
      sorting?: Sorting;
    }): Promise<Event[] | null> => {
      asyncActions.start();
      try {
        const response = await EventService.fetchEvents(
          options?.eventOptions,
          options?.pagination,
          options?.sorting
        );
        if (response.success && response.data) {
          dispatch({ type: "EVENT_SUCCESS", payload: response.data });
          return response.data;
        }
        return null;
      } catch (error) {
        handleError(error, "Gagal mengambil daftar event");
        return null;
      }
    },
    [handleError]
  );

  const searchEvents = useCallback(
    async (
      query: string,
      options?: { eventOptions?: EventOptions; pagination?: Pagination }
    ): Promise<Event[] | null> => {
      asyncActions.start();
      try {
        const response = await EventService.searchEvents(
          query,
          options?.eventOptions,
          options?.pagination
        );
        if (response.success && response.data) {
          dispatch({ type: "EVENT_SUCCESS", payload: response.data });
          return response.data;
        }
        return null;
      } catch (error) {
        handleError(error, "Gagal mencari event");
        return null;
      }
    },
    [handleError]
  );

  const fetchTrendingEvents = useCallback(
    async (options?: {
      eventOptions?: EventOptions;
      pagination?: Pagination;
      sorting?: Sorting;
    }): Promise<Event[] | null> => {
      asyncActions.start();
      try {
        const response = await EventService.fetchTrendingEvents(
          options?.eventOptions,
          options?.pagination,
          options?.sorting
        );
        if (response.success && response.data) {
          dispatch({ type: "TRENDING_EVENT_SUCCESS", payload: response.data });
          return response.data;
        }
        return null;
      } catch (error) {
        handleError(error, "Gagal mengambil daftar trending event");
        return null;
      }
    },
    [handleError]
  );

  const fetchRelatedEvents = useCallback(
    async (
      eventId: string,
      options?: { eventOptions?: EventOptions; pagination?: Pagination }
    ): Promise<Event[] | null> => {
      asyncActions.start();
      try {
        const response = await EventService.getRelatedEvents(
          eventId,
          options?.eventOptions,
          options?.pagination
        );
        if (response.success && response.data) {
          dispatch({ type: "EVENT_SUCCESS", payload: response.data });
          return response.data;
        }
        return null;
      } catch (error) {
        handleError(error, "Gagal mengambil event terkait");
        return null;
      }
    },
    [handleError]
  );

  const createEvent = useCallback(
    async (eventData: EventCreate): Promise<Event | null> => {
      asyncActions.start();
      try {
        const response = await EventService.createEvent(eventData);
        if (response) {
          // Optimistic update
          dispatch({
            type: "EVENT_SUCCESS",
            payload: [...state.allEvents, response],
          });
          notify.success("Berhasil", { message: "Event berhasil dibuat" });
          return response;
        }
        return null;
      } catch (error) {
        handleError(error, "Gagal membuat event");
        return null;
      }
    },
    [handleError, state.allEvents]
  );

  const updateEvent = useCallback(
    async (eventData: EventUpdate): Promise<Event | null> => {
      asyncActions.start();
      try {
        const response = await EventService.updateEvent(eventData);
        if (response) {
          dispatch({
            type: "EVENT_SUCCESS",
            payload: state.allEvents.map((e) =>
              e.id === eventData.id ? { ...e, ...response } : e
            ),
          });
          notify.success("Berhasil", { message: "Event berhasil diperbarui" });
          return response;
        }
        return null;
      } catch (error) {
        handleError(error, "Gagal memperbarui event");
        return null;
      }
    },
    [handleError, state.allEvents]
  );

  const deleteEvent = useCallback(
    async (eventId: string): Promise<boolean> => {
      asyncActions.start();
      try {
        await EventService.deleteEvent(eventId);
        dispatch({
          type: "EVENT_SUCCESS",
          payload: state.allEvents.filter((e) => e.id !== eventId),
        });
        notify.success("Berhasil", { message: "Event berhasil dihapus" });
        return true;
      } catch (error) {
        handleError(error, "Gagal menghapus event");
        return false;
      }
    },
    [handleError, state.allEvents]
  );

  const getEventById = useCallback(
    async (eventId: string): Promise<Event | null> => {
      let foundEvent = state.allEvents.find((e) => e.id === eventId) ?? null;
      if (!foundEvent) {
        foundEvent = await EventService.getEventById(eventId);
      }
      const mutableEvent = foundEvent as any;
      if (mutableEvent && typeof mutableEvent.views === "object") {
        mutableEvent.views = mutableEvent.views?.views || 0;
      }
      dispatch({
        type: "SET_SINGLE_EVENT",
        payload: (mutableEvent as Event) || null,
      });
      return (mutableEvent as Event) || null;
    },
    [state.allEvents]
  );

  const getEventByName = useCallback(
    async (eventName: string): Promise<Event | null> => {
      const found = state.allEvents.find((e) => e.name === eventName) ?? null;
      return found;
    },
    [state.allEvents]
  );

  const updateEventViews = useCallback(
    async (eventId: string): Promise<boolean> => {
      try {
        await EventService.updateEventViews(eventId);
        return true;
      } catch (error) {
        handleError(error, "Gagal memperbarui tampilan event");
        return false;
      }
    },
    [handleError]
  );

  const clearError = useCallback(
    () => asyncActions.clearError(),
    [asyncActions]
  );
  const resetEventState = useCallback(
    () => asyncActions.reset(),
    [asyncActions]
  );

  const contextValue = useMemo<EventContextType>(
    () => ({
      event: state.selectedEvent,
      events: state.allEvents,
      trendingEvents: state.trendingEvents,
      isLoading: state.isLoading,
      error: state.error,
      fetchEvents,
      searchEvents,
      fetchTrendingEvents,
      fetchRelatedEvents,
      createEvent,
      updateEvent,
      deleteEvent,
      getEventById,
      getEventByName,
      updateEventViews,
      clearError,
      resetEventState,
    }),
    [
      state.selectedEvent,
      state.allEvents,
      state.trendingEvents,
      state.isLoading,
      state.error,
      fetchEvents,
      searchEvents,
      fetchTrendingEvents,
      fetchRelatedEvents,
      createEvent,
      updateEvent,
      deleteEvent,
      getEventById,
      getEventByName,
      updateEventViews,
      clearError,
      resetEventState,
    ]
  );

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
}
