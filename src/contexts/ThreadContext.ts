import {
  CheckParticipant,
  Thread,
  ThreadCreateData,
  ThreadJoinData
} from "@/types/Thread";
import { createContext } from "react";

/**
 * Thread context type definition with enhanced methods and error handling
 */
export interface ThreadContextType {
  thread?: Thread | null;
  isLoading: boolean;
  error: string | null;
  isCurrentUserParticipant: boolean;

  // Thread Read Operations
  fetchThreadByEventId: (
    eventId: string,
    currentUserId: string
  ) => Promise<Thread | null>;

  // Thread Write Operations
  createEventThread: (threadData: ThreadCreateData) => Promise<Thread | null>;

  joinEventThread: (joinData: ThreadJoinData) => Promise<boolean>;

  // Participation Management
  checkCurrentUserParticipation: (payload: CheckParticipant) => boolean;

  // State Management Methods
  clearError: () => void;
  resetThreadState: () => void;
}

/**
 * Create the context with an undefined default value
 */
export const ThreadContext = createContext<ThreadContextType | undefined>(
  undefined
);
