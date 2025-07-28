import { EventContext } from '@/contexts/EventContext';
import { useContext } from 'react';

/**
 * Custom hook for accessing the event context
 * Throws an error if used outside of an EventProvider
 */
export const useEvent = () => {
  const context = useContext(EventContext);

  if (context === undefined) {
    throw new Error("useEvent must be used within an EventProvider");
  }

  return context;
}; 