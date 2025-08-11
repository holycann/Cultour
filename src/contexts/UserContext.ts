import { User } from "@/types/User";
import {
  UpdateAvatar,
  UpdateIdentity,
  UserProfile,
  UserProfilePayload
} from "@/types/UserProfile";
import { createContext } from "react";

/**
 * User context type definition with enhanced methods and error handling
 */
export interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  // Profile Management Methods
  fetchUserProfile: (userId?: string) => Promise<UserProfile | null>;
  createUserProfile: (userProfileData: UserProfilePayload) => Promise<UserProfile | null>;
  updateProfile: (profileData: UserProfilePayload) => Promise<UserProfilePayload | null>;
  
  // File Upload Methods
  uploadAvatar: (
    payload: UpdateAvatar
  ) => Promise<string | null>;
  
  uploadIdentity: (
    payload: UpdateIdentity
  ) => Promise<string | null>;

  // State Management Methods
  clearError: () => void;
  resetUserState: () => void;
}

/**
 * Create the context with a undefined default value
 */
export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
