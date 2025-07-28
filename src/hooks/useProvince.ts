import { ProvinceContext } from '@/contexts/ProvinceContext';
import { useContext } from 'react';

/**
 * Custom hook for accessing the province context
 * Throws an error if used outside of a ProvinceProvider
 */
export const useProvince = () => {
  const context = useContext(ProvinceContext);

  if (context === undefined) {
    throw new Error("useProvince must be used within a ProvinceProvider");
  }

  return context;
}; 