import { User, UserProfile } from '@/types/User';
import { createContext } from 'react';

/**
 * User context type definition
 */
export interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchUserProfile: (userId: string) => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  uploadAvatar: (avatarFile: File | { uri: string; type?: string; name?: string }) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Create the context with a undefined default value
 */
export const UserContext = createContext<UserContextType | undefined>(undefined); 