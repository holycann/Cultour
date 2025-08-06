import { supabase } from "@/config/supabase";
import { AuthCredentials, AuthUser, RegistrationData } from "@/types/User";
import { validateEmail, validatePassword } from "@/utils/validation";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Authentication service for managing user authentication operations
 */
export class AuthService {
  /**
   * Login with email and password
   * @param credentials User login credentials
   * @returns Promise resolving to authenticated user or null
   */
  static async login({
    email,
    password,
  }: AuthCredentials): Promise<AuthUser | null> {
    // Validate inputs
    if (!email || !password) {
      throw new Error("Mohon isi semua field");
    }

    if (!validateEmail(email)) {
      throw new Error("Format email tidak valid");
    }

    if (!validatePassword(password)) {
      throw new Error("Password minimal 6 karakter");
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        switch (error.message) {
          case "Invalid login credentials":
            throw new Error("Email atau password salah");
          case "Email not confirmed":
            throw new Error("Silakan konfirmasi email Anda terlebih dahulu");
          default:
            throw new Error(error.message || "Terjadi kesalahan saat login");
        }
      }

      return data.user ? this.mapSupabaseUserToAuthUser(data.user) : null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Terjadi kesalahan saat login";

      throw new Error(errorMessage);
    }
  }

  /**
   * Register a new user
   * @param registrationData User registration details
   * @returns Promise resolving to authenticated user or null
   */
  static async register({
    email,
    password,
  }: RegistrationData): Promise<AuthUser | null> {
    // Validate inputs
    if (!email || !password) {
      throw new Error("Mohon isi semua field");
    }

    if (!validateEmail(email)) {
      throw new Error("Format email tidak valid");
    }

    if (!validatePassword(password)) {
      throw new Error("Password minimal 6 karakter");
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        switch (error.message) {
          case "User already exists":
            throw new Error("Email sudah terdaftar");
          case "Invalid email format":
            throw new Error("Format email tidak valid");
          default:
            throw new Error(error.message || "Gagal melakukan registrasi");
        }
      }

      // If user is created successfully, return auth user
      if (data.user) {
        return this.mapSupabaseUserToAuthUser(data.user);
      }

      return null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal melakukan registrasi";

      throw new Error(errorMessage);
    }
  }

  /**
   * Sign in with OAuth provider
   * @param provider OAuth provider name
   * @returns Promise resolving to authenticated user or null
   */
  static async loginWithOAuth(provider: "google"): Promise<string> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: "cultour://oauth-callback",
          queryParams: {
            prompt: "select_account",
          },
          skipBrowserRedirect: false,
          scopes: provider === "google" ? "email profile" : undefined,
        },
      });

      if (error) {
        throw new Error(error.message || `Gagal login dengan ${provider}`);
      }

      return data.url;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Gagal login dengan ${provider}`;

      throw new Error(errorMessage);
    }
  }

  /**
   * Exchange OAuth code for session
   * @param code OAuth code received from provider
   * @returns Promise resolving to void
   */
  static async exchangeCodeForSession(code: string): Promise<void> {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        throw new Error(error.message || "Gagal menukar kode OAuth");
      }
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Gagal menukar kode OAuth"
      );
    }
  }

  /**
   * Send password reset email
   * @param email User's email address
   * @returns Promise resolving to boolean indicating success
   */
  static async forgotPassword(email: string): Promise<boolean> {
    if (!email) {
      throw new Error("Mohon isi email");
    }

    if (!validateEmail(email)) {
      throw new Error("Format email tidak valid");
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "cultour://reset-password", // Custom deep link
      });

      if (error) {
        throw new Error(error.message || "Gagal mengirim email reset password");
      }

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal mengirim email reset password";

      throw new Error(errorMessage);
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message || "Gagal logout");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal logout";

      throw new Error(errorMessage);
    }
  }

  /**
   * Get current authentication token
   * @returns Promise resolving to authentication token or null
   */
  static async getAuthToken(): Promise<string | null> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      return session?.access_token || null;
    } catch (error) {
      console.error("Failed to get auth token:", error);
      return null;
    }
  }

  /**
   * Get current authenticated user with token
   * @returns Promise resolving to authenticated user with token or null
   */
  static async getCurrentUser(): Promise<
    (AuthUser & { token?: string }) | null
  > {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data } = await supabase.auth.getUser();

      if (!data.user) return null;

      const authUser = this.mapSupabaseUserToAuthUser(data.user);

      return {
        ...authUser,
        token: sessionData.session?.access_token,
      };
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  }

  /**
   * Set authentication token in storage
   * @param token Authentication token to store
   * @returns Promise resolving to boolean indicating success
   */
  static async setAuthToken(token: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem("userToken", token);
      return true;
    } catch (error) {
      console.error("Failed to set auth token:", error);
      return false;
    }
  }

  /**
   * Map Supabase user to AuthUser type
   * @param user Supabase user object
   * @returns Mapped AuthUser
   */
  static mapSupabaseUserToAuthUser(user: any): AuthUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullname: user.user_metadata?.fullname,
      avatar_url: user.user_metadata?.avatar_url,
    };
  }
}
