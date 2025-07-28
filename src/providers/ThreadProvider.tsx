import { ThreadContext } from "@/contexts/ThreadContext";
import { ThreadService } from "@/services/threadService";
import { parseError } from "@/types/AppError";
import { Thread, ThreadCreateData, ThreadJoinData, ThreadUpdateData } from "@/types/Thread";
import { showDialogError, showDialogSuccess } from "@/utils/alert";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";

/**
 * Thread state type for reducer
 */
interface ThreadState {
  threads: Thread[];
  currentThread?: Thread;
  isLoading: boolean;
  error: string | null;
}

/**
 * Thread action types for reducer
 */
type ThreadAction =
  | { type: "THREAD_START" }
  | { type: "THREAD_SUCCESS"; payload: Thread }
  | { type: "THREAD_UPDATE"; payload: Thread }
  | { type: "THREAD_ERROR"; payload: string }
  | { type: "THREAD_CLEAR_ERROR" }
  | { type: "THREAD_RESET" };

/**
 * Initial thread state
 */
const initialState: ThreadState = {
  threads: [],
  currentThread: undefined,
  isLoading: false,
  error: null,
};

/**
 * Reducer function for thread state management
 */
function threadReducer(state: ThreadState, action: ThreadAction): ThreadState {
  switch (action.type) {
    case "THREAD_START":
      return { ...state, isLoading: true, error: null };
    case "THREAD_SUCCESS":
      return {
        ...state,
        isLoading: false,
        threads: state.threads.some(t => t.id === action.payload.id)
          ? state.threads.map(t => t.id === action.payload.id ? action.payload : t)
          : [...state.threads, action.payload],
        currentThread: action.payload,
        error: null
      };
    case "THREAD_UPDATE":
      return {
        ...state,
        isLoading: false,
        threads: state.threads.map(t => 
          t.id === action.payload.id ? action.payload : t
        ),
        currentThread: state.currentThread?.id === action.payload.id 
          ? action.payload 
          : state.currentThread,
        error: null
      };
    case "THREAD_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "THREAD_CLEAR_ERROR":
      return { ...state, error: null };
    case "THREAD_RESET":
      return initialState;
    default:
      return state;
  }
}

interface ThreadProviderProps {
  children: ReactNode;
}

export function ThreadProvider({ children }: ThreadProviderProps) {
  const [state, dispatch] = useReducer(threadReducer, initialState);

  /**
   * Handle any API errors
   */
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const appError = parseError(error);
    const errorMessage = customMessage || appError.message;

    dispatch({ type: "THREAD_ERROR", payload: errorMessage });
    showDialogError("Error", errorMessage);
  }, []);

  /**
   * Get thread by event ID
   */
  const getThreadByEventId = useCallback(
    (eventId: string) => {
      return state.threads.find(thread => thread.event_id === eventId);
    },
    [state.threads]
  );

  /**
   * Create event thread
   */
  const createEventThread = useCallback(
    async (threadData: ThreadCreateData) => {
      dispatch({ type: "THREAD_START" });

      try {
        const thread = await ThreadService.createEventThread(threadData);

        if (thread) {
          dispatch({ type: "THREAD_SUCCESS", payload: thread });
          showDialogSuccess("Berhasil", "Thread event berhasil dibuat");
          return thread;
        }

        return null;
      } catch (error) {
        handleError(error, "Gagal membuat thread event");
        return null;
      }
    },
    [handleError]
  );

  /**
   * Join event thread
   */
  const joinEventThread = useCallback(
    async (joinData: ThreadJoinData) => {
      dispatch({ type: "THREAD_START" });

      try {
        const thread = await ThreadService.joinEventThread(joinData);

        if (thread) {
          dispatch({ type: "THREAD_SUCCESS", payload: thread });
          showDialogSuccess("Berhasil", "Bergabung ke thread event");
          return thread;
        }

        return null;
      } catch (error) {
        handleError(error, "Gagal bergabung ke thread event");
        return null;
      }
    },
    [handleError]
  );

  /**
   * Update thread
   */
  const updateThread = useCallback(
    async (threadId: string, threadData: ThreadUpdateData) => {
      dispatch({ type: "THREAD_START" });

      try {
        const thread = await ThreadService.updateThread(threadId, threadData);

        if (thread) {
          dispatch({ type: "THREAD_UPDATE", payload: thread });
          showDialogSuccess("Berhasil", "Thread berhasil diperbarui");
          return thread;
        }

        return null;
      } catch (error) {
        handleError(error, "Gagal memperbarui thread");
        return null;
      }
    },
    [handleError]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    dispatch({ type: "THREAD_CLEAR_ERROR" });
  }, []);

  /**
   * Context value
   */
  const value = useMemo(
    () => ({
      threads: state.threads,
      currentThread: state.currentThread,
      isLoading: state.isLoading,
      error: state.error,
      getThreadByEventId,
      createEventThread,
      joinEventThread,
      updateThread,
      clearError,
    }),
    [
      state.threads,
      state.currentThread,
      state.isLoading,
      state.error,
      getThreadByEventId,
      createEventThread,
      joinEventThread,
      updateThread,
      clearError,
    ]
  );

  return (
    <ThreadContext.Provider value={value}>
      {children}
    </ThreadContext.Provider>
  );
} 