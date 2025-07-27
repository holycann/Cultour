import { Badge, UserBadge } from "@/types/Badge";
import { createContext } from "react";

/**
 * Badge context type definition
 */
export interface BadgeContextType {
  badges: Badge[];
  userBadges: UserBadge[];
  isLoading: boolean;
  error: string | null;
  fetchBadges: () => Promise<void>;
  fetchUserBadges: (userId: string) => Promise<void>;
  addBadgeToUser: (userId: string, badgeId: string) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Create the context with a undefined default value
 */
export const BadgeContext = createContext<BadgeContextType | undefined>(
  undefined
);