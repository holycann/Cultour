import { Thread, ThreadCreateData, ThreadJoinData, ThreadUpdateData } from '@/types/Thread';
import { createContext } from 'react';

/**
 * Thread context type definition
 */
export interface ThreadContextType {
  threads: Thread[];
  currentThread?: Thread;
  isLoading: boolean;
  error: string | null;

  // Thread Methods
  getThreadByEventId: (eventId: string) => Thread | undefined;
  createEventThread: (threadData: ThreadCreateData) => Promise<Thread | null>;
  joinEventThread: (joinData: ThreadJoinData) => Promise<Thread | null>;
  updateThread: (threadId: string, threadData: ThreadUpdateData) => Promise<Thread | null>;
  
  clearError: () => void;
}

/**
 * Create the context with an undefined default value
 */
export const ThreadContext = createContext<ThreadContextType | undefined>(undefined);
