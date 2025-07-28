import { LocationContext } from '@/contexts/LocationContext';
import { useContext } from 'react';

/**
 * Custom hook for accessing the location context
 * Throws an error if used outside of a LocationProvider
 */
export const useLocation = () => {
  const context = useContext(LocationContext);

  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }

  return context;
}; 