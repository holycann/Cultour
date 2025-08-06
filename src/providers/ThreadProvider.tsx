import {
  ThreadContext,
  ThreadContextType,
  ThreadState,
} from "@/contexts/ThreadContext";
import { ThreadResult, ThreadService } from "@/services/threadService";
import {
  Thread,
  ThreadCreateData,
  ThreadJoinData,
  ThreadUpdateData,
} from "@/types/Thread";
import { showDialogError, showDialogSuccess } from "@/utils/alert";
import { ReactNode, useCallback, useMemo, useReducer } from "react";

/**
 * Thread state type for reducer
 */
interface ThreadReducerState extends ThreadState {
  threads: Thread[];
  currentThread?: Thread | null;
  isLoading: boolean;
  error: string | null;
  isCurrentUserParticipant: boolean;
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
  | { type: "THREAD_RESET" }
  | { type: "SET_CURRENT_USER_PARTICIPANT"; payload: boolean }
  | { type: "SET_CURRENT_THREAD"; payload: Thread | null };

/**
 * Initial thread state
 */
const initialState: ThreadReducerState = {
  threads: [],
  currentThread: null,
  isLoading: false,
  error: null,
  isCurrentUserParticipant: false,
};

/**
 * Reducer function for thread state management
 */
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
        threads: state.threads.some((t) => t.id === action.payload.id)
          ? state.threads.map((t) =>
              t.id === action.payload.id ? action.payload : t
            )
          : [...state.threads, action.payload],
        currentThread: action.payload,
        error: null,
      };
    case "THREAD_UPDATE":
      return {
        ...state,
        isLoading: false,
        threads: state.threads.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
        currentThread:
          state.currentThread?.id === action.payload.id
            ? action.payload
            : state.currentThread,
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
      return { ...state, currentThread: action.payload };
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
   * Handle API results and extract data or error
   */
  const handleApiResult = useCallback(
    <T,>(result: ThreadResult<T>, errorMessage: string): T | null => {
      if (!result.success) {
        const message = result.error || errorMessage;
        dispatch({ type: "THREAD_ERROR", payload: message });
        showDialogError("Error", message);
        return null;
      }
      return result.data;
    },
    []
  );

  /**
   * Check if current user is a participant in the thread
   * This is crucial for determining if a user can send messages
   */
  const checkCurrentUserParticipation = useCallback(
    (thread?: Thread | null, currentUserId?: string) => {
      console.log("thread:", thread);
      console.log("currentUserId:", currentUserId);

      if (!thread || !currentUserId) {
        dispatch({ type: "SET_CURRENT_USER_PARTICIPANT", payload: false });
        return false;
      }

      // Check if user is in the participants list
      if (thread.discussion_participants.length === 0) {
        dispatch({ type: "SET_CURRENT_USER_PARTICIPANT", payload: false });
        return false;
      }

      const isParticipant = thread.discussion_participants.some(
        (participant) => participant.user_id === currentUserId
      );

      // Update state with participation status
      dispatch({
        type: "SET_CURRENT_USER_PARTICIPANT",
        payload: isParticipant,
      });

      console.log(
        `User ${currentUserId} participation status for thread ${thread.id}: ${isParticipant}`
      );

      return isParticipant;
    },
    []
  );

  /**
   * Get thread by event ID
   */
  const getThreadByEventId = useCallback(
    async (eventId: string, currentUserId?: string): Promise<Thread | null> => {
      dispatch({ type: "THREAD_START" });

      const result = await ThreadService.getThreadByEventId(eventId);

      // Thread not found but API call was successful
      if (result.success && !result.data) {
        console.log(`No thread found for event ${eventId}`);
        // Reset state since no thread exists
        dispatch({ type: "SET_CURRENT_THREAD", payload: null });
        return null;
      }

      // Process API result
      const thread = handleApiResult(result, "Failed to get thread for event");

      if (thread) {
        console.log(`Thread found for event ${eventId}: ${thread.id}`);
        // Set thread in state
        dispatch({ type: "THREAD_SUCCESS", payload: thread });

        // Check and update user participation status
        if (currentUserId) {
          checkCurrentUserParticipation(thread, currentUserId);
        }
      }

      return thread;
    },
    [handleApiResult, checkCurrentUserParticipation]
  );

  /**
   * Create event thread
   */
  const createEventThread = useCallback(
    async (threadData: ThreadCreateData): Promise<boolean> => {
      dispatch({ type: "THREAD_START" });

      const result = await ThreadService.createEventThread(threadData);
      handleApiResult(result, "Failed to create thread");

      if (result.success) {
        console.log(
          `Thread created for event ${threadData.event_id}: ${result.data?.id}`
        );

        showDialogSuccess("Success", "Discussion thread created successfully");
      }

      return result.success;
    },
    [handleApiResult]
  );

  /**
   * Join event thread
   */
  const joinEventThread = useCallback(
    async (joinData: ThreadJoinData): Promise<boolean> => {
      dispatch({ type: "THREAD_START" });

      const result = await ThreadService.joinEventThread(joinData);
      handleApiResult(result, "Failed to join thread");

      if (result.success) {
        console.log(`Joined thread ${joinData.thread_id} successfully`);
        dispatch({ type: "SET_CURRENT_USER_PARTICIPANT", payload: true });
        showDialogSuccess("Success", "Joined discussion successfully");
      }

      return result.success;
    },
    [handleApiResult]
  );

  /**
   * Update thread
   */
  const updateThread = useCallback(
    async (
      threadId: string,
      threadData: ThreadUpdateData
    ): Promise<boolean> => {
      dispatch({ type: "THREAD_START" });

      const result = await ThreadService.updateThread(threadId, threadData);
      handleApiResult(result, "Failed to update thread");

      if (result.success) {
        dispatch({ type: "THREAD_UPDATE", payload: result.data as Thread });
        showDialogSuccess("Success", "Thread updated successfully");
      }

      return result.success;
    },
    [handleApiResult]
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
    (): ThreadContextType => ({
      threads: state.threads,
      currentThread: state.currentThread,
      isLoading: state.isLoading,
      error: state.error,
      isCurrentUserParticipant: state.isCurrentUserParticipant,
      getThreadByEventId,
      createEventThread,
      joinEventThread,
      updateThread,
      clearError,
      checkCurrentUserParticipation,
    }),
    [
      state.threads,
      state.currentThread,
      state.isLoading,
      state.error,
      state.isCurrentUserParticipant,
      getThreadByEventId,
      createEventThread,
      joinEventThread,
      updateThread,
      clearError,
      checkCurrentUserParticipation,
    ]
  );

  return (
    <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>
  );
}
