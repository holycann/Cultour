import { supabase } from "@/config/supabase";
import { AuthCredentials, RegistrationData, User } from "@/types/User";
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
  static async login(value: AuthCredentials): Promise<User | null> {
    // Validate inputs
    if (!value) {
      throw new Error("Mohon isi semua field");
    }

    if (!validateEmail(value.email)) {
      throw new Error("Format email tidak valid");
    }

    if (!validatePassword(value.password)) {
      throw new Error("Password minimal 6 karakter");
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: value.email,
        password: value.password,
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
  static async register(value: RegistrationData): Promise<User | null> {
    // Validate inputs
    if (!value) {
      throw new Error("Mohon isi semua field");
    }

    if (!validateEmail(value.email)) {
      throw new Error("Format email tidak valid");
    }

    if (!validatePassword(value.password)) {
      throw new Error("Password minimal 6 karakter");
    }

    if (value.phone) {
      if (!validatePassword(value.phone)) {
        throw new Error(
          "Format nomor telepon tidak sesuai. Gunakan format +62, 62, atau 0 diikuti 8-11 digit angka"
        );
      }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: value.email,
        password: value.password,
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
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      console.error("Failed to exchange code for session:", error);
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
      let token = (await AsyncStorage.getItem("userToken")) || undefined;

      if (!token) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        token = session?.access_token;
      }

      return token || null;
    } catch (error) {
      console.error("Failed to get auth token:", error);
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
   * Get current authenticated user with token
   * @returns Promise resolving to authenticated user with token or null
   */
  static async getCurrentUser(): Promise<(User & { token?: string }) | null> {
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
   * Map Supabase user to AuthUser type
   * @param user Supabase user object
   * @returns Mapped AuthUser
   */
  static mapSupabaseUserToAuthUser(user: any): User {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
  }
}
