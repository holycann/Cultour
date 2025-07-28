import { UserContext } from "@/contexts/UserContext";
import { useContext } from "react";

/**
 * Custom hook for accessing the user context
 * Throws an error if used outside of a UserProvider
 */
export const useUser = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
};
