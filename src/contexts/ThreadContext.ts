import { Thread, ThreadCreateData, ThreadJoinData, ThreadUpdateData } from '@/types/Thread';
import { createContext } from 'react';

/**
 * Thread context type definition
 */
export interface ThreadContextType {
  threads: Thread[];
  currentThread?: Thread | null;
  isLoading: boolean;
  error: string | null;
  isCurrentUserParticipant: boolean;

  // Thread Methods
  getThreadByEventId: (eventId: string, currentUserId?: string) => Promise<Thread | null>;
  createEventThread: (threadData: ThreadCreateData) => Promise<Thread | null>;
  joinEventThread: (joinData: ThreadJoinData) => Promise<Thread | null>;
  updateThread: (threadId: string, threadData: ThreadUpdateData) => Promise<Thread | null>;
  checkCurrentUserParticipation: (thread?: Thread | null, currentUserId?: string) => boolean;
  
  clearError: () => void;
}

/**
 * Create the context with an undefined default value
 */
export const ThreadContext = createContext<ThreadContextType | undefined>(undefined);
