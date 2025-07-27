import { supabase } from "@/config/supabase";
import { AuthCredentials, AuthUser, RegistrationData } from "@/types/User";
import { validateEmail, validatePassword } from "@/utils/validation";

/**
 * Authentication service for managing user authentication operations
 */
export class AuthService {
  /**
   * Login with email and password
   * @param credentials User login credentials
   * @returns Promise resolving to authenticated user or null
   */
  static async login({ email, password }: AuthCredentials): Promise<AuthUser | null> {
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
          case 'Invalid login credentials':
            throw new Error("Email atau password salah");
          case 'Email not confirmed':
            throw new Error("Silakan konfirmasi email Anda terlebih dahulu");
          default:
            throw new Error(error.message || "Terjadi kesalahan saat login");
        }
      }

      return data.user ? this.mapSupabaseUserToAuthUser(data.user) : null;
    } catch (error) {
      const errorMessage = 
        error instanceof Error 
          ? error.message 
          : "Terjadi kesalahan saat login";
      
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
    display_name,
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
        options: {
          data: {
            display_name,
          },
          emailRedirectTo: 'cultour://verify-email', // Custom deep link
        },
      });

      if (error) {
        switch (error.message) {
          case 'User already exists':
            throw new Error("Email sudah terdaftar");
          case 'Invalid email format':
            throw new Error("Format email tidak valid");
          default:
            throw new Error(error.message || "Gagal melakukan registrasi");
        }
      }

      return data.user ? this.mapSupabaseUserToAuthUser(data.user) : null;
    } catch (error) {
      const errorMessage = 
        error instanceof Error 
          ? error.message 
          : "Gagal melakukan registrasi";
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Sign in with OAuth provider
   * @param provider OAuth provider name
   * @returns Promise resolving to authenticated user or null
   */
  static async loginWithOAuth(provider: 'google' | 'apple' | 'github'): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'cultour://oauth-callback', // Custom deep link
          scopes: provider === 'google' ? 'email profile' : undefined,
        },
      });

      if (error) {
        throw new Error(error.message || `Gagal login dengan ${provider}`);
      }

      return null; // OAuth redirects, so we return null here
    } catch (error) {
      const errorMessage = 
        error instanceof Error 
          ? error.message 
          : `Gagal login dengan ${provider}`;
      
      throw new Error(errorMessage);
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
        redirectTo: 'cultour://reset-password', // Custom deep link
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
        error instanceof Error 
          ? error.message 
          : "Gagal logout";
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      return user ? this.mapSupabaseUserToAuthUser(user) : null;
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
  private static mapSupabaseUserToAuthUser(user: any): AuthUser {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      display_name: user.user_metadata?.display_name,
      avatar_url: user.user_metadata?.avatar_url,
      is_anonymous: user.is_anonymous,
      is_sso_user: user.app_metadata?.is_sso_user,
    };
  }
} 