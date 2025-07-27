import { AuthContext } from '@/contexts/AuthContext';
import { useContext } from 'react';

/**
 * Custom hook for accessing the auth context
 * Throws an error if used outside of an AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
