import { BadgeContext } from "@/contexts/BadgeContext";
import { BadgeService } from "@/services/badgeService";
import { parseError } from "@/types/AppError";
import { Badge, UserBadge } from "@/types/Badge";
import { showDialogError, showDialogSuccess } from "@/utils/alert";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";

/**
 * Badge state type for reducer
 */
interface BadgeState {
  badges: Badge[];
  userBadges: UserBadge[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Badge action types for reducer
 */
type BadgeAction =
  | { type: "BADGE_START" }
  | { type: "BADGE_SUCCESS_ALL"; payload: Badge[] }
  | { type: "BADGE_SUCCESS_USER"; payload: UserBadge[] }
  | { type: "BADGE_ERROR"; payload: string }
  | { type: "BADGE_CLEAR_ERROR" }
  | { type: "BADGE_RESET" };

/**
 * Initial badge state
 */
const initialState: BadgeState = {
  badges: [],
  userBadges: [],
  isLoading: false,
  error: null,
};

/**
 * Reducer function for badge state management
 */
function badgeReducer(state: BadgeState, action: BadgeAction): BadgeState {
  switch (action.type) {
    case "BADGE_START":
      return { ...state, isLoading: true, error: null };
    case "BADGE_SUCCESS_ALL":
      return {
        ...state,
        isLoading: false,
        badges: action.payload,
        error: null,
      };
    case "BADGE_SUCCESS_USER":
      return {
        ...state,
        isLoading: false,
        userBadges: action.payload,
        error: null,
      };
    case "BADGE_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "BADGE_CLEAR_ERROR":
      return { ...state, error: null };
    case "BADGE_RESET":
      return initialState;
    default:
      return state;
  }
}

interface BadgeProviderProps {
  children: ReactNode;
}

export function BadgeProvider({ children }: BadgeProviderProps) {
  const [state, dispatch] = useReducer(badgeReducer, initialState);

  /**
   * Handle any API errors
   */
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const appError = parseError(error);
    const errorMessage = customMessage || appError.message;

    dispatch({ type: "BADGE_ERROR", payload: errorMessage });
    showDialogError("Error", errorMessage);
  }, []);

  /**
   * Fetch all badges
   */
  const fetchBadges = useCallback(async () => {
    dispatch({ type: "BADGE_START" });

    try {
      const data = await BadgeService.fetchBadges();

      dispatch({
        type: "BADGE_SUCCESS_ALL",
        payload: data,
      });
    } catch (error) {
      handleError(error, "Gagal mengambil daftar badge");
    }
  }, [handleError]);

  /**
   * Fetch user badges
   */
  const fetchUserBadges = useCallback(
    async (userId: string) => {
      dispatch({ type: "BADGE_START" });

      try {
        const data = await BadgeService.fetchUserBadges(userId);

        dispatch({
          type: "BADGE_SUCCESS_USER",
          payload: data,
        });
      } catch (error) {
        handleError(error, "Gagal mengambil badge pengguna");
      }
    },
    [handleError]
  );

  /**
   * Add badge to user
   */
  const addBadgeToUser = useCallback(
    async (userId: string, badgeId: string) => {
      dispatch({ type: "BADGE_START" });

      try {
        const data = await BadgeService.addBadgeToUser(userId, badgeId);

        // Optimistically update local state
        dispatch((prev: BadgeState) => ({
          ...prev,
          userBadges: data ? [...prev.userBadges, data] : prev.userBadges,
        }));

        showDialogSuccess("Berhasil", "Badge berhasil ditambahkan");
        return true;
      } catch (error) {
        handleError(error, "Gagal menambahkan badge");
        return false;
      }
    },
    [handleError]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    dispatch({ type: "BADGE_CLEAR_ERROR" });
  }, []);

  /**
   * Context value
   */
  const value = useMemo(
    () => ({
      badges: state.badges,
      userBadges: state.userBadges,
      isLoading: state.isLoading,
      error: state.error,
      fetchBadges,
      fetchUserBadges,
      addBadgeToUser,
      clearError,
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
    ]
  );

  return (
    <BadgeContext.Provider value={value}>{children}</BadgeContext.Provider>
  );
}
