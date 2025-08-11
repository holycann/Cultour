import { AuthCredentials, RegistrationData, User } from "@/types/User";
import { createContext } from "react";

/**
 * Authentication context type definition with enhanced methods and error handling
 */
export interface AuthContextType {
  user: User | null;
  token?: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Authentication Methods
  login: (credentials: AuthCredentials) => Promise<boolean>;
  register: (registrationData: RegistrationData) => Promise<boolean>;
  loginWithOAuth: (provider: "google") => Promise<string>;
  exchangeCodeForSession: (code: string) => Promise<void>;
  logout: () => Promise<void>;

  // Token Management
  getAuthToken: () => Promise<string | null>;
  setAuthToken: (token: string) => Promise<boolean>;

  // Error and State Management
  clearError: () => void;
  resetAuthState: () => void;
}

/**
 * Create the context with a undefined default value
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
