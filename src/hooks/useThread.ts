import { ThreadContext } from '@/contexts/ThreadContext';
import { useContext } from 'react';

/**
 * Custom hook for accessing the thread context
 * Throws an error if used outside of a ThreadProvider
 */
export const useThread = () => {
  const context = useContext(ThreadContext);

  if (context === undefined) {
    throw new Error("useThread must be used within a ThreadProvider");
  }

  return context;
};
