import { AuthCredentials, AuthUser, RegistrationData } from "@/types/User";
import { createContext } from "react";

/**
 * Authentication context type definition
 */
export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: AuthCredentials) => Promise<boolean>;
  register: (registrationData: RegistrationData) => Promise<boolean>;
  loginWithOAuth: (provider: "google") => Promise<string>;
  exchangeCodeForSession: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Create the context with a undefined default value
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
