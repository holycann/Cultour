import { supabase } from "@/config/supabase";
import { AuthContext, AuthContextType } from "@/contexts/AuthContext";
import { AuthService } from "@/services/authService";
import { UserService } from "@/services/userService";
import {
  AuthCredentials,
  AuthUser,
  RegistrationData,
  UserProfile,
} from "@/types/User";
import { showDialogError, showDialogSuccess } from "@/utils/alert";
import { logger } from "@/utils/logger";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";

/**
 * Auth state type for reducer
 */
interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Auth action types for reducer
 */
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: AuthUser | null }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "AUTH_RESET" }
  | { type: "CLEAR_ERROR" };

/**
 * Initial auth state
 */
const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
};

/**
 * Reducer function for auth state management
 */
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true, error: null };
    case "AUTH_SUCCESS":
      return { ...state, isLoading: false, user: action.payload, error: null };
    case "AUTH_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "AUTH_RESET":
      return { ...state, user: null, error: null };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Check for authentication status on mount and subscribe to auth changes
   */
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        dispatch({
          type: "AUTH_SUCCESS",
          payload: currentUser,
        });
      } catch (error) {
        console.error("Auth status check error:", error);
        dispatch({ type: "AUTH_SUCCESS", payload: null });
      }
    };

    checkAuthStatus();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        dispatch({ type: "AUTH_START" });
        const user = session?.user
          ? AuthService.mapSupabaseUserToAuthUser(session.user)
          : null;

        dispatch({
          type: "AUTH_SUCCESS",
          payload: user,
        });

        if (
          event === "SIGNED_IN" &&
          session?.user?.app_metadata?.provider !== "email"
        ) {
          await AuthService.setAuthToken(session?.access_token || "");

          const existingUser = await UserService.getUserProfile();

          if (existingUser) return;

          const userProfile = await UserService.createUserProfile({
            user_id: session?.user?.id,
            fullname: session?.user?.user_metadata?.name,
            bio: "",
            avatar_url: session?.user?.user_metadata?.avatar_url,
            identity_image_url: "",
          });

          if (!userProfile) {
            showDialogError("Error", "Gagal membuat profil pengguna");
          }
        }
      }
    );

    // Clean up subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(
    async (credentials: AuthCredentials): Promise<boolean> => {
      dispatch({ type: "AUTH_START" });

      try {
        const user = await AuthService.login(credentials);

        dispatch({
          type: "AUTH_SUCCESS",
          payload: user,
        });
        showDialogSuccess("Success", "Login berhasil!");
        return true;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat login";

        logger.error("Auth", "Error Login", error);
        dispatch({ type: "AUTH_ERROR", payload: errorMessage });
        showDialogError("Error", errorMessage);
        return false;
      }
    },
    []
  );

  /**
   * Register a new user
   */
  const register = useCallback(
    async (registrationData: RegistrationData): Promise<boolean> => {
      dispatch({ type: "AUTH_START" });

      try {
        const user = await AuthService.register(registrationData);

        if (user) {
          dispatch({
            type: "AUTH_SUCCESS",
            payload: user,
          });

          // Create user profile after successful registration
          const userProfileData: Partial<UserProfile> = {
            user_id: user.id,
            fullname: registrationData.fullname || user.email.split("@")[0],
            bio: "",
            avatar_url: "",
            identity_image_url: "",
          };

          const profileCreated =
            await UserService.createUserProfile(userProfileData);

          if (!profileCreated) {
            throw new Error("Gagal membuat profil pengguna");
          }

          showDialogSuccess("Success", "Registrasi berhasil!");
          return true;
        }

        return false;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat registrasi";

        logger.error("Auth", "Error Register", error);
        dispatch({ type: "AUTH_ERROR", payload: errorMessage });
        showDialogError("Error", errorMessage);
        return false;
      }
    },
    []
  );

  /**
   * Login with OAuth provider
   */
  const loginWithOAuth = useCallback(
    async (provider: "google"): Promise<string> => {
      dispatch({ type: "AUTH_START" });

      try {
        const url = await AuthService.loginWithOAuth(provider);
        return url;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Gagal login dengan ${provider}`;

        dispatch({ type: "AUTH_ERROR", payload: errorMessage });
        showDialogError("Error", errorMessage);
        return "";
      }
    },
    []
  );

  /**
   * Exchange OAuth code for session
   */
  const exchangeCodeForSession = useCallback(
    async (code: string): Promise<void> => {
      dispatch({ type: "AUTH_START" });

      try {
        await AuthService.exchangeCodeForSession(code);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Gagal menukar kode OAuth";

        dispatch({ type: "AUTH_ERROR", payload: errorMessage });
        showDialogError("Error", errorMessage);
      }
    },
    []
  );

  /**
   * Send password reset email
   */
  const forgotPassword = useCallback(
    async (email: string): Promise<boolean> => {
      dispatch({ type: "AUTH_START" });

      try {
        await AuthService.forgotPassword(email);

        dispatch({ type: "AUTH_SUCCESS", payload: null });
        showDialogSuccess(
          "Email Terkirim",
          "Instruksi reset password telah dikirim ke email Anda"
        );
        return true;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Gagal mengirim email reset password";

        dispatch({ type: "AUTH_ERROR", payload: errorMessage });
        showDialogError("Error", errorMessage);
        return false;
      }
    },
    []
  );

  /**
   * Logout user
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await AuthService.logout();
      dispatch({ type: "AUTH_RESET" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal logout";

      dispatch({ type: "AUTH_ERROR", payload: errorMessage });
      showDialogError("Error", errorMessage);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  /**
   * Computed authentication status
   */
  const isAuthenticated = useMemo(() => !!state.user, [state.user]);

  /**
   * Context value
   */
  const value = useMemo(
    (): AuthContextType => ({
      user: state.user,
      isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
      login,
      register,
      loginWithOAuth,
      exchangeCodeForSession,
      logout,
      forgotPassword,
      clearError,
    }),
    [
      state.user,
      state.isLoading,
      state.error,
      isAuthenticated,
      login,
      register,
      loginWithOAuth,
      exchangeCodeForSession,
      logout,
      forgotPassword,
      clearError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
