import { MessageContext } from '@/contexts/MessageContext';
import { useContext } from 'react';

/**
 * Custom hook for accessing the message context
 * Throws an error if used outside of a MessageProvider
 */
export const useMessage = () => {
  const context = useContext(MessageContext);

  if (context === undefined) {
    throw new Error("useMessage must be used within a MessageProvider");
  }

  return context;
}; 