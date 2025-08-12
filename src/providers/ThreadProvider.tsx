import { ThreadContext, ThreadContextType } from "@/contexts/ThreadContext";
import notify from "@/services/notificationService";
import { ThreadService } from "@/services/threadService";
import {
  CheckParticipant,
  Thread,
  ThreadCreateData,
  ThreadJoinData,
  isUserParticipant,
} from "@/types/Thread";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";
import { createAsyncActions, withAsyncReducer } from "./asyncFactory";

type ThreadReducerState = {
  thread?: Thread | null;
  isLoading: boolean;
  error: string | null;
  isCurrentUserParticipant: boolean;
};

type ThreadAction =
  | { type: "THREAD_SUCCESS"; payload: Thread }
  | { type: "THREAD_UPDATE"; payload: Thread }
  | { type: "SET_CURRENT_USER_PARTICIPANT"; payload: boolean }
  | { type: "SET_CURRENT_THREAD"; payload: Thread | null };

const initialState: ThreadReducerState = {
  thread: null,
  isLoading: false,
  error: null,
  isCurrentUserParticipant: false,
};

function domainReducer(
  state: ThreadReducerState,
  action: ThreadAction
): ThreadReducerState {
  switch (action.type) {
    case "THREAD_SUCCESS":
      return {
        ...state,
        isLoading: false,
        thread: action.payload,
        error: null,
      };
    case "THREAD_UPDATE":
      return {
        ...state,
        isLoading: false,
        thread: action.payload,
        error: null,
      };
    case "SET_CURRENT_USER_PARTICIPANT":
      return { ...state, isCurrentUserParticipant: action.payload };
    case "SET_CURRENT_THREAD":
      return { ...state, thread: action.payload, isLoading: false };
    default:
      return state;
  }
}

const reducer = withAsyncReducer<ThreadReducerState, ThreadAction>(
  domainReducer as any,
  initialState
);

export function ThreadProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const asyncActions = createAsyncActions(dispatch);

  const handleError = useCallback(
    (error: unknown, customMessage?: string) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : customMessage || "An unexpected thread error occurred";
      asyncActions.error(errorMessage);
      notify.error("Thread Error", { message: errorMessage });
    },
    [asyncActions]
  );

  const setCurrentThread = useCallback((thread: Thread | null) => {
    dispatch({ type: "SET_CURRENT_THREAD", payload: thread });
  }, []);

  const setParticipant = useCallback((isParticipant: boolean) => {
    dispatch({ type: "SET_CURRENT_USER_PARTICIPANT", payload: isParticipant });
  }, []);

  const checkCurrentUserParticipation = useCallback(
    (payload: CheckParticipant): boolean => {
      // Validate input parameters
      if (!payload.thread || !payload.currentUserID) {
        setParticipant(false);
        return false;
      }

      // Use utility function for safe participant checking
      const isParticipant = isUserParticipant(payload);

      // Fallback to creator check
      const isCreator = payload.thread.creator.id === payload.currentUserID;

      // Determine final participation status
      const finalParticipationStatus = isParticipant || isCreator;

      // Update context state
      setParticipant(finalParticipationStatus);
      return finalParticipationStatus;
    },
    [setParticipant]
  );

  const fetchThreadByEventId = useCallback(
    async (eventId: string, currentUserId?: string): Promise<Thread | null> => {
      asyncActions.start();

      try {
        const result = await ThreadService.getThreadByEventId(eventId);

        // Handle no thread scenario
        if (!result.success) {
          const errorMessage =
            result.message || "Failed to get thread for event";
          asyncActions.error(errorMessage);
          notify.error("Error", { message: errorMessage });
          setCurrentThread(null);
          return null;
        }

        // Handle empty thread data
        if (!result.data) {
          setCurrentThread(null);
          return null;
        }

        if (!result.data.id || !result.data.event_id) {
          asyncActions.error("Invalid thread data received");
          notify.error("Error", { message: "Invalid thread data" });
          return null;
        }

        // Dispatch thread success and check participation
        dispatch({ type: "THREAD_SUCCESS", payload: result.data });

        if (currentUserId) {
          checkCurrentUserParticipation({
            thread: result.data,
            currentUserID: currentUserId,
          });
        }

        return result.data;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown error occurred while fetching thread";

        asyncActions.error(errorMessage);
        notify.error("Error", { message: errorMessage });
        return null;
      }
    },
    [checkCurrentUserParticipation, setCurrentThread]
  );

  const createEventThread = useCallback(
    async (threadData: ThreadCreateData): Promise<Thread | null> => {
      asyncActions.start();

      try {
        const result = await ThreadService.createEventThread(threadData);

        // Handle creation failure
        if (!result.success) {
          const errorMessage = result.message || "Failed to create thread";
          asyncActions.error(errorMessage);
          notify.error("Error", { message: errorMessage });
          return null;
        }

        // Validate thread data
        const thread = result.data as Thread;
        if (!thread || !thread.id || !thread.event_id) {
          asyncActions.error("Invalid thread data received after creation");
          notify.error("Error", { message: "Invalid thread data" });
          return null;
        }

        // Dispatch thread success
        dispatch({ type: "THREAD_SUCCESS", payload: thread });
        notify.success("Success", { message: "Discussion thread created successfully" });

        return thread;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown error occurred while creating thread";

        asyncActions.error(errorMessage);
        notify.error("Error", { message: errorMessage });
        return null;
      }
    },
    []
  );

  const joinEventThread = useCallback(
    async (joinData: ThreadJoinData): Promise<boolean> => {
      // Validate input parameters
      if (!joinData.thread_id || !joinData.event_id) {
        asyncActions.error(
          "Invalid join data: Thread ID and Event ID are required"
        );
        notify.error("Error", { message: "Invalid join data" });
        return false;
      }

      asyncActions.start();

      try {
        const result = await ThreadService.joinEventThread(joinData);

        // Comprehensive result validation
        if (!result.success) {
          const errorMessage = result.message || "Failed to join event thread";
          asyncActions.error(errorMessage);
          notify.error("Error", { message: errorMessage });
          return false;
        }

        dispatch({
          type: "THREAD_UPDATE",
          payload: {
            ...(state.thread as Thread),
            discussion_participants: [
              ...(state.thread?.discussion_participants || []),
              {
                user_id: joinData.user_id,
                thread_id: joinData.thread_id,
                joined_at: new Date().toISOString(),
              },
            ],
          },
        });

        // Show success dialog
        notify.success("Success", { message: "Successfully joined the thread" });

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown error occurred while joining thread";

        asyncActions.error(errorMessage);
        notify.error("Error", { message: errorMessage });
        return false;
      }
    },
    []
  );

  const clearError = useCallback(() => {
    asyncActions.clearError();
  }, [asyncActions]);

  const resetThreadState = useCallback(() => {
    asyncActions.reset();
  }, [asyncActions]);

  const contextValue = useMemo<ThreadContextType>(
    () => ({
      thread: state.thread,
      isLoading: state.isLoading,
      error: state.error,
      isCurrentUserParticipant: state.isCurrentUserParticipant,
      fetchThreadByEventId,
      checkCurrentUserParticipation,
      createEventThread,
      joinEventThread,
      clearError,
      resetThreadState,
    }),
    [
      state.thread,
      state.isLoading,
      state.error,
      state.isCurrentUserParticipant,
      fetchThreadByEventId,
      checkCurrentUserParticipation,
      createEventThread,
      joinEventThread,
      clearError,
      resetThreadState,
    ]
  );

  return (
    <ThreadContext.Provider value={contextValue}>
      {children}
    </ThreadContext.Provider>
  );
}
