import { UserContext, UserContextType } from "@/contexts/UserContext";
import { UserService } from "@/services/userService";
import { User } from "@/types/User";
import {
  UpdateAvatar,
  UpdateIdentity,
  UserProfile,
  UserProfilePayload,
} from "@/types/UserProfile";
import { showDialogError, showDialogSuccess } from "@/utils/alert";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";

/**
 * User state type for reducer
 */
interface UserState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * User action types for reducer
 */
type UserAction =
  | { type: "USER_START" }
  | { type: "PROFILE_SUCCESS"; payload: UserProfile }
  | { type: "USER_SUCCESS"; payload: User }
  | { type: "USER_ERROR"; payload: string }
  | { type: "USER_RESET" }
  | { type: "USER_CLEAR_ERROR" }
  | { type: "AVATAR_UPDATE"; payload: string }
  | { type: "PROFILE_UPDATE"; payload: Partial<UserProfile> };

/**
 * Initial user state
 */
const initialState: UserState = {
  user: null,
  profile: null,
  isLoading: false,
  error: null,
};

/**
 * Reducer function for user state management
 */
function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case "USER_START":
      return { ...state, isLoading: true, error: null };
    case "PROFILE_SUCCESS":
      return {
        ...state,
        profile: action.payload,
        isLoading: false,
        error: null,
      };
    case "USER_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        error: null,
      };
    case "USER_ERROR":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case "USER_RESET":
      return initialState;
    case "USER_CLEAR_ERROR":
      return { ...state, error: null };
    case "AVATAR_UPDATE":
      return {
        ...state,
        profile: state.profile
          ? { ...state.profile, avatar_url: action.payload }
          : null,
        isLoading: false,
        error: null,
      };
    case "PROFILE_UPDATE":
      return {
        ...state,
        profile: state.profile ? { ...state.profile, ...action.payload } : null,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  /**
   * Handle any API errors
   */
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const errorMessage =
      error instanceof Error
        ? error.message
        : customMessage || "An unexpected error occurred";

    dispatch({ type: "USER_ERROR", payload: errorMessage });
    showDialogError("Error", errorMessage);
  }, []);

  /**
   * Fetch user profile
   */
  const fetchUserProfile = useCallback(async () => {
    dispatch({ type: "USER_START" });
    try {
      const profile = await UserService.getUserProfile();

      if (profile) {
        dispatch({
          type: "PROFILE_SUCCESS",
          payload: profile,
        });
      }
      return profile;
    } catch (error) {
      handleError(error, "Gagal mengambil profil pengguna");
      return null;
    }
  }, [handleError]);

  /**
   * Create user profile
   */
  const createUserProfile = useCallback(
    async (userProfileData: UserProfilePayload) => {
      dispatch({ type: "USER_START" });
      try {
        const profile = await UserService.createUserProfile(userProfileData);

        if (profile) {
          dispatch({
            type: "PROFILE_SUCCESS",
            payload: profile,
          });
          showDialogSuccess("Berhasil", "Profil pengguna berhasil dibuat");
        }
        return profile;
      } catch (error) {
        handleError(error, "Gagal membuat profil pengguna");
        return null;
      }
    },
    [handleError]
  );

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (profileData: UserProfilePayload) => {
      dispatch({ type: "USER_START" });
      try {
        const updatedProfile = await UserService.updateProfile(profileData);

        if (updatedProfile) {
          // Use the new PROFILE_UPDATE action for partial updates
          dispatch({
            type: "PROFILE_UPDATE",
            payload: updatedProfile as Partial<UserProfile>,
          });
          showDialogSuccess("Berhasil", "Profil berhasil diperbarui");
        }
        return updatedProfile;
      } catch (error) {
        handleError(error, "Gagal memperbarui profil");
        return null;
      }
    },
    [handleError]
  );

  /**
   * Upload avatar
   */
  const uploadAvatar = useCallback(
    async (payload: UpdateAvatar) => {
      dispatch({ type: "USER_START" });
      try {
        const avatarUrl = await UserService.uploadAvatar(payload);

        if (avatarUrl) {
          showDialogSuccess("Berhasil", "Avatar berhasil diunggah");
          // Use the new AVATAR_UPDATE action instead of manually constructing state
          dispatch({
            type: "AVATAR_UPDATE",
            payload: avatarUrl,
          });
        }
        return avatarUrl;
      } catch (error) {
        handleError(error, "Gagal mengunggah avatar");
        return null;
      }
    },
    [handleError]
  );

  /**
   * Upload identity
   */
  const uploadIdentity = useCallback(
    async (payload: UpdateIdentity) => {
      dispatch({ type: "USER_START" });
      try {
        const identityUrl = await UserService.verifyIdentity(payload);

        if (identityUrl) {
          showDialogSuccess("Berhasil", "Identitas berhasil diunggah");
          // If identity verification affects profile, update it
          if (state.profile) {
            dispatch({
              type: "PROFILE_UPDATE",
              payload: {
                identity_image_url: identityUrl,
              },
            });
          }
        }
        return identityUrl;
      } catch (error) {
        handleError(error, "Gagal mengunggah identitas");
        return null;
      }
    },
    [handleError, state.profile]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    dispatch({ type: "USER_CLEAR_ERROR" });
  }, []);

  const resetUserState = useCallback(() => {
    dispatch({ type: "USER_RESET" });
  }, []);

  const contextValue = useMemo<UserContextType>(
    () => ({
      user: state.user,
      profile: state.profile,
      isLoading: state.isLoading,
      error: state.error,
      fetchUserProfile,
      createUserProfile,
      updateProfile,
      uploadAvatar,
      uploadIdentity,
      clearError,
      resetUserState,
    }),
    [
      state.user,
      state.profile,
      state.isLoading,
      state.error,
      fetchUserProfile,
      createUserProfile,
      updateProfile,
      uploadAvatar,
      uploadIdentity,
      clearError,
      resetUserState,
    ]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}
