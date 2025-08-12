import { supabase } from "@/config/supabase";
import { AuthContext, AuthContextType } from "@/contexts/AuthContext";
import { AuthService } from "@/services/authService";
import notify from "@/services/notificationService";
import { UserService } from "@/services/userService";
import { AuthCredentials, RegistrationData, User } from "@/types/User";
import { UserProfilePayload } from "@/types/UserProfile";
import { logger } from "@/utils/logger";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { createAsyncActions, withAsyncReducer } from "./asyncFactory";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "AUTH_SUCCESS"; payload: { user: User; token?: string } }
  | { type: "SET_TOKEN"; payload: string | null };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  error: null,
};

function domainReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token || null,
        error: null,
      };
    case "SET_TOKEN":
      return { ...state, token: action.payload };
    default:
      return state;
  }
}

const reducer = withAsyncReducer<AuthState, AuthAction>(domainReducer as any, initialState);

export function AuthProvider({ children }: { children: ReactNode }) {
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

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          dispatch({
            type: "AUTH_SUCCESS",
            payload: {
              user: currentUser,
              token: currentUser.token,
            },
          });
        } else {
          asyncActions.reset();
        }
      } catch (error) {
        logger.error("Check Auth Status", "Auth status check error:", error);
        asyncActions.reset();
      }
    };

    checkAuthStatus();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        asyncActions.start();
        const user = session?.user
          ? AuthService.mapSupabaseUserToAuthUser(session.user)
          : null;

        let token = await AuthService.getAuthToken();
        if (session?.access_token && session?.access_token !== token) {
          await setAuthToken(session?.access_token);
        }

        if (user) {
          dispatch({
            type: "AUTH_SUCCESS",
            payload: {
              user,
              token: session?.access_token,
            },
          });

          if (
            event === "SIGNED_IN" &&
            session?.user?.app_metadata?.provider !== "email"
          ) {
            await AuthService.setAuthToken(session?.access_token || "");

            const existingUser = await UserService.getUserProfile();

            if (existingUser) return;

            const userProfileData: UserProfilePayload = {
              id: session?.user?.id || "",
              fullname: session?.user?.user_metadata?.name || "",
              bio: null,
              avatar_url: session?.user?.user_metadata?.avatar_url || null,
            };

            const profileCreated =
              await UserService.createUserProfile(userProfileData);

            if (!profileCreated) {
              notify.error("Error", { message: "Gagal membuat profil pengguna" });
            }
          }
        } else {
          asyncActions.reset();
        }
      }
    );

    // Clean up subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(
    async (credentials: AuthCredentials): Promise<boolean> => {
      asyncActions.start();

      try {
        const user = await AuthService.login(credentials);

        if (user) {
          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user },
          });
          notify.success("Success", { message: "Login berhasil!" });
          return true;
        }
        return false;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat login";

        logger.error("Auth", "Error Login", error);
        handleError(error, errorMessage);
        return false;
      }
    },
    [handleError]
  );

  const register = useCallback(
    async (registrationData: RegistrationData): Promise<boolean> => {
      asyncActions.start();

      try {
        const user = await AuthService.register(registrationData);

        if (user) {
          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user },
          });

          // Create user profile after successful registration
          const userProfileData: UserProfilePayload = {
            id: user.id,
            fullname: registrationData.fullname || user.email.split("@")[0],
            bio: null,
            avatar_url: null,
          };

          const profileCreated =
            await UserService.createUserProfile(userProfileData);

          if (!profileCreated) {
            throw new Error("Gagal membuat profil pengguna");
          }

          notify.success("Success", { message: "Registrasi berhasil!" });
          return true;
        }

        return false;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat registrasi";

        logger.error("Auth", "Error Register", error);
        handleError(error, errorMessage);
        return false;
      }
    },
    [handleError]
  );

  const loginWithOAuth = useCallback(
    async (provider: "google"): Promise<string> => {
      asyncActions.start();

      try {
        const url = await AuthService.loginWithOAuth(provider);
        return url;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Gagal login dengan ${provider}`;

        handleError(error, errorMessage);
        return "";
      }
    },
    [handleError]
  );

  const exchangeCodeForSession = useCallback(
    async (code: string): Promise<void> => {
      asyncActions.start();

      try {
        await AuthService.exchangeCodeForSession(code);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Gagal menukar kode OAuth";

        handleError(error, errorMessage);
      }
    },
    [handleError]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await AuthService.logout();
      asyncActions.reset();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal logout";

      handleError(error, errorMessage);
    }
  }, [handleError]);

  const getAuthToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await AuthService.getAuthToken();
      dispatch({ type: "SET_TOKEN", payload: token });
      return token;
    } catch (error) {
      logger.error("Auth Provider", "Failed to get auth token", error);
      return null;
    }
  }, []);

  const setAuthToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      const result = await AuthService.setAuthToken(token);
      if (result) {
        dispatch({ type: "SET_TOKEN", payload: token });
      }
      return result;
    } catch (error) {
      logger.error("Auth Provider", "Failed to set auth token", error);
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    asyncActions.clearError();
  }, [asyncActions]);

  const resetAuthState = useCallback(() => {
    asyncActions.reset();
  }, [asyncActions]);

  const isAuthenticated = useMemo(() => !!state.user, [state.user]);

  const value = useMemo(
    (): AuthContextType => ({
      user: state.user,
      token: state.token,
      isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
      login,
      register,
      loginWithOAuth,
      exchangeCodeForSession,
      logout,
      getAuthToken,
      setAuthToken,
      clearError,
      resetAuthState,
    }),
    [
      state.user,
      state.token,
      state.isLoading,
      state.error,
      isAuthenticated,
      login,
      register,
      loginWithOAuth,
      exchangeCodeForSession,
      logout,
      getAuthToken,
      setAuthToken,
      clearError,
      resetAuthState,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
