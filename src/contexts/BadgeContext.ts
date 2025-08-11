import { Pagination, Sorting } from "@/types/ApiResponse";
import { Badge, UserBadge } from "@/types/Badge";
import { createContext } from "react";

/**
 * Badge context type definition with enhanced methods and error handling
 */
export interface BadgeContextType {
  badges: Badge[];
  userBadges: UserBadge[];
  isLoading: boolean;
  error: string | null;

  // Badge Fetching Methods
  fetchBadges: (options?: {
    pagination?: Pagination;
    sorting?: Sorting;
  }) => Promise<Badge[] | null>;

  fetchUserBadges: (options?: {
    pagination?: Pagination;
    sorting?: Sorting;
  }) => Promise<UserBadge[] | null>;

  // User Badge Management
  addBadgeToUser: (badgeId: string) => Promise<UserBadge | null>;

  // State Management Methods
  clearError: () => void;
  resetBadgeState: () => void;
}

/**
 * Create the context with a undefined default value
 */
export const BadgeContext = createContext<BadgeContextType | undefined>(
  undefined
);
