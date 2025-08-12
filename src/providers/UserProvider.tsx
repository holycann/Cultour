import { UserContext, UserContextType } from "@/contexts/UserContext";
import notify from "@/services/notificationService";
import { UserService } from "@/services/userService";
import { User } from "@/types/User";
import {
  UpdateAvatar,
  UpdateIdentity,
  UserProfile,
  UserProfilePayload,
} from "@/types/UserProfile";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";
import { createAsyncActions, withAsyncReducer } from "./asyncFactory";

interface UserState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

type UserAction =
  | { type: "PROFILE_SUCCESS"; payload: UserProfile }
  | { type: "USER_SUCCESS"; payload: User }
  | { type: "AVATAR_UPDATE"; payload: string }
  | { type: "PROFILE_UPDATE"; payload: Partial<UserProfile> };

const initialState: UserState = {
  user: null,
  profile: null,
  isLoading: false,
  error: null,
};

function domainReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
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

const reducer = withAsyncReducer<UserState, UserAction>(domainReducer as any, initialState);

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const asyncActions = createAsyncActions(dispatch);

  const handleError = useCallback(
    (error: unknown, customMessage?: string) => {
      const errorMessage = error instanceof Error ? error.message : customMessage || "An unexpected error occurred";
      asyncActions.error(errorMessage);
      notify.error("Error", { message: errorMessage });
    },
    [asyncActions]
  );

  const fetchUserProfile = useCallback(async () => {
    asyncActions.start();
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

  const createUserProfile = useCallback(
    async (userProfileData: UserProfilePayload) => {
      asyncActions.start();
      try {
        const profile = await UserService.createUserProfile(userProfileData);

        if (profile) {
          dispatch({
            type: "PROFILE_SUCCESS",
            payload: profile,
          });
          notify.success("Berhasil", { message: "Profil pengguna berhasil dibuat" });
        }
        return profile;
      } catch (error) {
        handleError(error, "Gagal membuat profil pengguna");
        return null;
      }
    },
    [handleError]
  );

  const updateProfile = useCallback(
    async (profileData: UserProfilePayload) => {
      asyncActions.start();
      try {
        const updatedProfile = await UserService.updateProfile(profileData);

        if (updatedProfile) {
          // Use the new PROFILE_UPDATE action for partial updates
          dispatch({
            type: "PROFILE_UPDATE",
            payload: updatedProfile as Partial<UserProfile>,
          });
          notify.success("Berhasil", { message: "Profil berhasil diperbarui" });
        }
        return updatedProfile;
      } catch (error) {
        handleError(error, "Gagal memperbarui profil");
        return null;
      }
    },
    [handleError]
  );

  const uploadAvatar = useCallback(
    async (payload: UpdateAvatar) => {
      asyncActions.start();
      try {
        const avatarUrl = await UserService.uploadAvatar(payload);

        if (avatarUrl) {
          notify.success("Berhasil", { message: "Avatar berhasil diunggah" });
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

  const uploadIdentity = useCallback(
    async (payload: UpdateIdentity) => {
      asyncActions.start();
      try {
        const identityUrl = await UserService.verifyIdentity(payload);

        if (identityUrl) {
          notify.success("Berhasil", { message: "Identitas berhasil diunggah" });
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

  const clearError = useCallback(() => {
    asyncActions.clearError();
  }, [asyncActions]);

  const resetUserState = useCallback(() => {
    asyncActions.reset();
  }, [asyncActions]);

  const isAuthenticated = useMemo(() => !!state.user, [state.user]);

  const value = useMemo(
    (): UserContextType => ({
      user: state.user,
      profile: state.profile,
      isLoading: state.isLoading,
      error: state.error,
      isAuthenticated,
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
      isAuthenticated,
      fetchUserProfile,
      createUserProfile,
      updateProfile,
      uploadAvatar,
      uploadIdentity,
      clearError,
      resetUserState,
    ]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
