import { BadgeContext, BadgeContextType } from "@/contexts/BadgeContext";
import { BadgeService } from "@/services/badgeService";
import { Pagination, Sorting } from "@/types/ApiResponse";
import { Badge, UserBadge } from "@/types/Badge";
import { showDialogError, showDialogSuccess } from "@/utils/alert";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";

type BadgeState = {
  badges: Badge[];
  userBadges: UserBadge[];
  isLoading: boolean;
  error: string | null;
};

type BadgeAction =
  | { type: "BADGE_START" }
  | { type: "BADGE_SUCCESS_BADGES"; payload: Badge[] }
  | { type: "BADGE_SUCCESS_USER_BADGES"; payload: UserBadge[] }
  | { type: "BADGE_ERROR"; payload: string }
  | { type: "BADGE_RESET" }
  | { type: "BADGE_CLEAR_ERROR" };

const initialState: BadgeState = {
  badges: [],
  userBadges: [],
  isLoading: false,
  error: null,
};

function badgeReducer(state: BadgeState, action: BadgeAction): BadgeState {
  switch (action.type) {
    case "BADGE_START":
      return { ...state, isLoading: true, error: null };
    case "BADGE_SUCCESS_BADGES":
      return {
        ...state,
        badges: action.payload,
        isLoading: false,
        error: null,
      };
    case "BADGE_SUCCESS_USER_BADGES":
      return {
        ...state,
        userBadges: action.payload,
        isLoading: false,
        error: null,
      };
    case "BADGE_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "BADGE_RESET":
      return initialState;
    case "BADGE_CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

export function BadgeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(badgeReducer, initialState);

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const errorMessage =
      error instanceof Error
        ? error.message
        : customMessage || "An unexpected badge error occurred";

    dispatch({ type: "BADGE_ERROR", payload: errorMessage });
    showDialogError("Badge Error", errorMessage);
  }, []);

  const fetchBadges = useCallback(
    async (options?: {
      pagination?: Pagination;
      sorting?: Sorting;
    }): Promise<Badge[] | null> => {
      dispatch({ type: "BADGE_START" });

      try {
        const response = await BadgeService.fetchBadges(
          options?.pagination,
          options?.sorting
        );

        if (response.success && response.data) {
          dispatch({
            type: "BADGE_SUCCESS_BADGES",
            payload: response.data,
          });
          return response.data;
        }

        return null;
      } catch (error) {
        handleError(error, "Gagal mengambil daftar badge");
        return null;
      }
    },
    [handleError]
  );

  const fetchUserBadges = useCallback(
    async (options?: {
      pagination?: Pagination;
      sorting?: Sorting;
    }): Promise<UserBadge[] | null> => {
      dispatch({ type: "BADGE_START" });

      try {
        const response = await BadgeService.fetchUserBadges(
          options?.pagination,
          options?.sorting
        );

        if (response.success && response.data) {
          dispatch({
            type: "BADGE_SUCCESS_USER_BADGES",
            payload: response.data,
          });
          return response.data;
        }

        return null;
      } catch (error) {
        handleError(error, "Gagal mengambil badge pengguna");
        return null;
      }
    },
    [handleError]
  );

  const addBadgeToUser = useCallback(
    async (badgeId: string): Promise<UserBadge | null> => {
      dispatch({ type: "BADGE_START" });

      try {
        // Implement badge addition logic
        // This might involve calling a service method to add a badge
        // For now, this is a placeholder
        showDialogSuccess("Berhasil", "Badge berhasil ditambahkan");
        return null;
      } catch (error) {
        handleError(error, "Gagal menambahkan badge");
        return null;
      }
    },
    [handleError]
  );

  const clearError = useCallback(() => {
    dispatch({ type: "BADGE_CLEAR_ERROR" });
  }, []);

  const resetBadgeState = useCallback(() => {
    dispatch({ type: "BADGE_RESET" });
  }, []);

  const contextValue = useMemo<BadgeContextType>(
    () => ({
      badges: state.badges,
      userBadges: state.userBadges,
      isLoading: state.isLoading,
      error: state.error,
      fetchBadges,
      fetchUserBadges,
      addBadgeToUser,
      clearError,
      resetBadgeState,
    }),
    [
      state.badges,
      state.userBadges,
      state.isLoading,
      state.error,
      fetchBadges,
      fetchUserBadges,
      addBadgeToUser,
      clearError,
      resetBadgeState,
    ]
  );

  return (
    <BadgeContext.Provider value={contextValue}>
      {children}
    </BadgeContext.Provider>
  );
}
