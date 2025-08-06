import { Thread, ThreadCreateData, ThreadJoinData, ThreadUpdateData } from '@/types/Thread';
import { createContext } from 'react';

/**
 * Thread state interface - read-only data about threads
 */
export interface ThreadState {
  threads: Thread[];
  currentThread?: Thread | null;
  isLoading: boolean;
  error: string | null;
  isCurrentUserParticipant: boolean;
}

/**
 * Thread read operations interface
 */
export interface ThreadReadOperations {
  getThreadByEventId: (eventId: string, currentUserId?: string) => Promise<Thread | null>;
  checkCurrentUserParticipation: (thread?: Thread | null, currentUserId?: string) => boolean;
}

/**
 * Thread write operations interface
 */
export interface ThreadWriteOperations {
  createEventThread: (threadData: ThreadCreateData) => Promise<boolean>;
  joinEventThread: (joinData: ThreadJoinData) => Promise<boolean>;
  updateThread: (threadId: string, threadData: ThreadUpdateData) => Promise<boolean>;
}

/**
 * Thread state management interface
 */
export interface ThreadStateManagement {
  clearError: () => void;
}

/**
 * Complete Thread context type that combines all interfaces
 */
export interface ThreadContextType extends 
  ThreadState, 
  ThreadReadOperations,
  ThreadWriteOperations, 
  ThreadStateManagement {}

/**
 * Create the context with an undefined default value
 */
export const ThreadContext = createContext<ThreadContextType | undefined>(undefined);
