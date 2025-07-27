import { CityContext } from '@/contexts/CityContext';
import { useContext } from 'react';

/**
 * Custom hook for accessing the city context
 * Throws an error if used outside of a CityProvider
 */
export const useCity = () => {
  const context = useContext(CityContext);

  if (context === undefined) {
    throw new Error("useCity must be used within a CityProvider");
  }

  return context;
}; 