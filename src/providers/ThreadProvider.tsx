import { ThreadContext, ThreadContextType } from "@/contexts/ThreadContext";
import { ThreadService } from "@/services/threadService";
import {
  CheckParticipant,
  Thread,
  ThreadCreateData,
  ThreadJoinData,
  isUserParticipant,
} from "@/types/Thread";
import { showDialogError, showDialogSuccess } from "@/utils/alert";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";

type ThreadReducerState = {
  thread?: Thread | null;
  isLoading: boolean;
  error: string | null;
  isCurrentUserParticipant: boolean;
};

type ThreadAction =
  | { type: "THREAD_START" }
  | { type: "THREAD_SUCCESS"; payload: Thread }
  | { type: "THREAD_UPDATE"; payload: Thread }
  | { type: "THREAD_ERROR"; payload: string }
  | { type: "THREAD_CLEAR_ERROR" }
  | { type: "THREAD_RESET" }
  | { type: "SET_CURRENT_USER_PARTICIPANT"; payload: boolean }
  | { type: "SET_CURRENT_THREAD"; payload: Thread | null };

const initialState: ThreadReducerState = {
  thread: null,
  isLoading: false,
  error: null,
  isCurrentUserParticipant: false,
};

function threadReducer(
  state: ThreadReducerState,
  action: ThreadAction
): ThreadReducerState {
  switch (action.type) {
    case "THREAD_START":
      return { ...state, isLoading: true, error: null };
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
    case "THREAD_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "THREAD_CLEAR_ERROR":
      return { ...state, error: null };
    case "THREAD_RESET":
      return initialState;
    case "SET_CURRENT_USER_PARTICIPANT":
      return { ...state, isCurrentUserParticipant: action.payload };
    case "SET_CURRENT_THREAD":
      return { ...state, thread: action.payload, isLoading: false };
    default:
      return state;
  }
}

export function ThreadProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(threadReducer, initialState);

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const errorMessage =
      error instanceof Error
        ? error.message
        : customMessage || "An unexpected thread error occurred";

    dispatch({ type: "THREAD_ERROR", payload: errorMessage });
    showDialogError("Thread Error", errorMessage);
  }, []);

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
      dispatch({ type: "THREAD_START" });

      try {
        const result = await ThreadService.getThreadByEventId(eventId);

        // Handle no thread scenario
        if (!result.success) {
          const errorMessage =
            result.message || "Failed to get thread for event";
          dispatch({ type: "THREAD_ERROR", payload: errorMessage });
          showDialogError("Error", errorMessage);
          setCurrentThread(null);
          return null;
        }

        // Handle empty thread data
        if (!result.data) {
          setCurrentThread(null);
          return null;
        }
        
        if (!result.data.id || !result.data.event_id) {
          dispatch({
            type: "THREAD_ERROR",
            payload: "Invalid thread data received",
          });
          showDialogError("Error", "Invalid thread data");
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

        dispatch({
          type: "THREAD_ERROR",
          payload: errorMessage,
        });

        showDialogError("Error", errorMessage);
        return null;
      }
    },
    [checkCurrentUserParticipation, setCurrentThread]
  );

  const createEventThread = useCallback(
    async (threadData: ThreadCreateData): Promise<Thread | null> => {
      dispatch({ type: "THREAD_START" });

      try {
        const result = await ThreadService.createEventThread(threadData);

        // Handle creation failure
        if (!result.success) {
          const errorMessage = result.message || "Failed to create thread";
          dispatch({ type: "THREAD_ERROR", payload: errorMessage });
          showDialogError("Error", errorMessage);
          return null;
        }

        // Validate thread data
        const thread = result.data as Thread;
        if (!thread || !thread.id || !thread.event_id) {
          dispatch({
            type: "THREAD_ERROR",
            payload: "Invalid thread data received after creation",
          });
          showDialogError("Error", "Invalid thread data");
          return null;
        }

        // Dispatch thread success
        dispatch({ type: "THREAD_SUCCESS", payload: thread });
        showDialogSuccess("Success", "Discussion thread created successfully");

        return thread;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown error occurred while creating thread";

        dispatch({
          type: "THREAD_ERROR",
          payload: errorMessage,
        });

        showDialogError("Error", errorMessage);
        return null;
      }
    },
    []
  );

  const joinEventThread = useCallback(
    async (joinData: ThreadJoinData): Promise<boolean> => {
      // Validate input parameters
      if (!joinData.thread_id || !joinData.event_id) {
        dispatch({
          type: "THREAD_ERROR",
          payload: "Invalid join data: Thread ID and Event ID are required",
        });
        showDialogError("Error", "Invalid join data");
        return false;
      }

      dispatch({ type: "THREAD_START" });

      try {
        const result = await ThreadService.joinEventThread(joinData);

        // Comprehensive result validation
        if (!result.success) {
          const errorMessage = result.message || "Failed to join event thread";
          dispatch({ type: "THREAD_ERROR", payload: errorMessage });
          showDialogError("Error", errorMessage);
          return false;
        }

        // Show success dialog
        showDialogSuccess("Success", "Successfully joined the thread");

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown error occurred while joining thread";

        dispatch({
          type: "THREAD_ERROR",
          payload: errorMessage,
        });

        showDialogError("Error", errorMessage);
        return false;
      }
    },
    []
  );

  const clearError = useCallback(() => {
    dispatch({ type: "THREAD_CLEAR_ERROR" });
  }, []);

  const resetThreadState = useCallback(() => {
    dispatch({ type: "THREAD_RESET" });
  }, []);

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
