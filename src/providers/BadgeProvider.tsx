import { BadgeContext, BadgeContextType } from "@/contexts/BadgeContext";
import { BadgeService } from "@/services/badgeService";
import notify from "@/services/notificationService";
import { Pagination, Sorting } from "@/types/ApiResponse";
import { Badge, UserBadge } from "@/types/Badge";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";
import { createAsyncActions, withAsyncReducer } from "./asyncFactory";

type BadgeState = {
  badges: Badge[];
  userBadges: UserBadge[];
  isLoading: boolean;
  error: string | null;
};

type BadgeAction =
  | { type: "BADGE_SUCCESS_BADGES"; payload: Badge[] }
  | { type: "BADGE_SUCCESS_USER_BADGES"; payload: UserBadge[] };

const initialState: BadgeState = {
  badges: [],
  userBadges: [],
  isLoading: false,
  error: null,
};

function domainReducer(state: BadgeState, action: BadgeAction): BadgeState {
  switch (action.type) {
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
    default:
      return state;
  }
}

const reducer = withAsyncReducer<BadgeState, BadgeAction>(domainReducer as any, initialState);

export function BadgeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const asyncActions = createAsyncActions(dispatch);

  const handleError = useCallback(
    (error: unknown, customMessage?: string) => {
      const errorMessage = error instanceof Error ? error.message : customMessage || "An unexpected badge error occurred";
      asyncActions.error(errorMessage);
      notify.error("Badge Error", { message: errorMessage });
    },
    [asyncActions]
  );

  const fetchBadges = useCallback(
    async (options?: {
      pagination?: Pagination;
      sorting?: Sorting;
    }): Promise<Badge[] | null> => {
      asyncActions.start();

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
      asyncActions.start();

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
      asyncActions.start();

      try {
        // Implement badge addition logic
        // This might involve calling a service method to add a badge
        // For now, this is a placeholder
        notify.success("Berhasil", { message: "Badge berhasil ditambahkan" });
        return null;
      } catch (error) {
        handleError(error, "Gagal menambahkan badge");
        return null;
      }
    },
    [handleError]
  );

  const clearError = useCallback(() => {
    asyncActions.clearError();
  }, [asyncActions]);

  const resetBadgeState = useCallback(() => {
    asyncActions.reset();
  }, [asyncActions]);

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
