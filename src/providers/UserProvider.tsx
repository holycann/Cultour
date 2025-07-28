import { UserContext } from "@/contexts/UserContext";
import { UserService } from "@/services/userService";
import { parseError } from "@/types/AppError";
import { User, UserProfile } from "@/types/User";
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
  | {
      type: "USER_SUCCESS";
      payload: { user: User | null; profile: UserProfile | null };
    }
  | { type: "USER_ERROR"; payload: string }
  | { type: "USER_CLEAR_ERROR" }
  | { type: "USER_RESET" };

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
    case "USER_SUCCESS":
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        profile: action.payload.profile,
        error: null,
      };
    case "USER_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "USER_CLEAR_ERROR":
      return { ...state, error: null };
    case "USER_RESET":
      return initialState;
    default:
      return state;
  }
}

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  /**
   * Handle any API errors
   */
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const appError = parseError(error);
    const errorMessage = customMessage || appError.message;

    dispatch({ type: "USER_ERROR", payload: errorMessage });
    showDialogError("Error", errorMessage);
  }, []);

  /**
   * Fetch user profile
   */
  const fetchUserProfile = useCallback(
    async (userId: string) => {
      dispatch({ type: "USER_START" });

      try {
        // Fetch user details
        const userData = await UserService.getUser(userId);

        // Fetch user profile
        const profileData = await UserService.getUserProfile(userId);

        dispatch({
          type: "USER_SUCCESS",
          payload: {
            user: userData,
            profile: profileData,
          },
        });
      } catch (error) {
        handleError(error, "Gagal mengambil profil pengguna");
      }
    },
    [handleError]
  );

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (profileData: Partial<UserProfile>) => {
      dispatch({ type: "USER_START" });

      try {
        if (!state.user?.id || !state.profile?.id) {
          throw new Error("Pengguna tidak terautentikasi");
        }

        // Kirim hanya field yang dibolehkan
        const payload = {
          user_id: state.user.id,
          fullname: profileData.fullname || state.profile.fullname,
          bio: profileData.bio ?? state.profile.bio,
          avatar_url: profileData.avatar_url ?? state.profile.avatar_url,
        };

        console.log("Sending profile payload:", payload); // Optional: debug

        await UserService.updateProfile(
          state.profile.id,
          payload as UserProfile
        );

        await fetchUserProfile(state.user.id);

        showDialogSuccess("Berhasil", "Profil berhasil diperbarui");
        return true;
      } catch (error) {
        handleError(error, "Gagal memperbarui profil");
        return false;
      }
    },
    [state.user, state.profile, handleError, fetchUserProfile]
  );

  /**
   * Update user
   */
  const updateUser = useCallback(
    async (userData: Partial<User>) => {
      dispatch({ type: "USER_START" });

      try {
        // Ensure we have a user_id
        if (!state.user?.id) {
          throw new Error("Pengguna tidak terautentikasi");
        }

        const updatedUser = await UserService.updateUser(
          state.user.id,
          userData
        );

        // Optimistically update local state
        dispatch({
          type: "USER_SUCCESS",
          payload: {
            user: { ...state.user, ...updatedUser } as User,
            profile: state.profile,
          },
        });

        showDialogSuccess("Berhasil", "Data pengguna berhasil diperbarui");
        return true;
      } catch (error) {
        handleError(error, "Gagal memperbarui data pengguna");
        return false;
      }
    },
    [state.user, handleError]
  );

  /**
   * Upload avatar
   */
  const uploadAvatar = useCallback(
    async (
      avatarFile: File | { uri: string; type?: string; name?: string }
    ) => {
      dispatch({ type: "USER_START" });

      try {
        // Ensure we have a user_id
        if (!state.user?.id) {
          throw new Error("Pengguna tidak terautentikasi");
        }

        await UserService.uploadAvatar(state.user.id, avatarFile);

        // Refetch profile dari backend agar avatar dan data lain sinkron
        await fetchUserProfile(state.user.id);

        showDialogSuccess("Berhasil", "Avatar berhasil diperbarui");
        return true;
      } catch (error) {
        handleError(error, "Gagal mengunggah avatar");
        return false;
      }
    },
    [state.user, handleError, fetchUserProfile]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    dispatch({ type: "USER_CLEAR_ERROR" });
  }, []);

  /**
   * Context value
   */
  const value = useMemo(
    () => ({
      user: state.user,
      profile: state.profile,
      isLoading: state.isLoading,
      error: state.error,
      fetchUserProfile,
      updateProfile,
      updateUser,
      uploadAvatar,
      clearError,
    }),
    [
      state.user,
      state.profile,
      state.isLoading,
      state.error,
      fetchUserProfile,
      updateProfile,
      updateUser,
      uploadAvatar,
      clearError,
    ]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
