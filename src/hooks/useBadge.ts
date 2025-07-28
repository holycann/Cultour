import { BadgeContext } from '@/contexts/BadgeContext';
import { useContext } from 'react';

/**
 * Custom hook for accessing the badge context
 * Throws an error if used outside of a BadgeProvider
 */
export const useBadge = () => {
  const context = useContext(BadgeContext);

  if (context === undefined) {
    throw new Error("useBadge must be used within a BadgeProvider");
  }

  return context;
}; 