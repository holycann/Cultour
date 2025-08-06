import { User, UserProfile } from "@/types/User";
import { getFileType } from "@/utils/file";
import { BaseApiService } from "./baseApiService";

/**
 * User service for managing user-related API operations
 */
export class UserService extends BaseApiService {
  /**
   * Create a new user profile
   * @param userProfileData User profile data for creating a new profile
   * @returns Promise resolving to created UserProfile or null
   */
  static async createUserProfile(
    userProfileData: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    try {
      const response = await this.post<Partial<UserProfile>, UserProfile>(
        "/profile",
        userProfileData
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to create user profile");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to create user profile:", error);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param userId User's unique identifier
   * @returns Promise resolving to User or null
   */
  static async getUser(userId: string): Promise<User | null> {
    try {
      // Gunakan backtick ``
      const response = await this.get<User>(`/users/${userId}`);

      if (!response.success) {
        throw new Error(response.error || "Failed to get user");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to get user:", error);
      throw error;
    }
  }

  /**
   * Update user
   * @param userId User's unique identifier
   * @param userData Partial user data to update
   * @returns Promise resolving to updated User or null
   */
  static async updateUser(
    userId: string,
    userData: Partial<User>
  ): Promise<User | null> {
    try {
      const response = await this.put<Partial<User>, User>(
        `/users/${userId}`,
        userData
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to update user");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  }

  /**
   * Get authenticated user profile
   * @returns Promise resolving to user profile or null
   */
  static async getUserProfile(): Promise<UserProfile | null> {
    try {
      const response = await this.get<UserProfile>(`/profile/me`);

      if (!response.success) return null;

      return response.data;
    } catch (error) {
      console.error("Failed to get user profile:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param profileId User Profile's unique identifier
   * @param profileData Full user profile data to update
   * @returns Promise resolving to updated user profile or null
   */
  static async updateProfile(
    profileId: string,
    profileData: UserProfile
  ): Promise<UserProfile | null> {
    try {
      const response = await this.put<UserProfile, UserProfile>(
        `/profile/${profileId}`,
        profileData
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to update user profile");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to update user profile:", error);
      throw error;
    }
  }

  /**
   * Upload user avatar
   * @param userProfileID User Profile's unique identifier
   * @param avatarFile File to upload
   * @returns Promise resolving to avatar URL or null
   */
  static async uploadAvatar(
    userProfileID: string,
    avatarFile: File | { uri: string; type?: string; name?: string }
  ): Promise<string | null> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      // Only support React Native or web File
      if ("uri" in avatarFile) {
        formData.append("avatar", {
          uri: avatarFile.uri,
          type: getFileType(avatarFile.uri),
          name: avatarFile.name || "avatar.jpg",
        } as any);
      } else {
        formData.append("avatar", avatarFile);
      }

      const response = await this.put<FormData, { avatarUrl: string }>(
        `/profile/${userProfileID}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to upload avatar");
      }

      if (!response.data) {
        throw new Error("No avatar URL returned");
      }

      return response.data.avatarUrl;
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      throw error;
    }
  }

  /**
   * Verify user identity by uploading identity image
   * @param userProfileID User Profile's unique identifier
   * @param identityFile File to upload (identity image)
   * @returns Promise resolving to identity image URL or null
   */
  static async verifyIdentity(
    userProfileID: string,
    identityFile: File | { uri: string; type?: string; name?: string }
  ): Promise<string | null> {
    try {
      const formData = new FormData();
      if ("uri" in identityFile) {
        formData.append("identity_image", {
          uri: identityFile.uri,
          type: getFileType(identityFile.uri),
          name: identityFile.name,
        } as any);
      } else {
        formData.append("identity_image", identityFile);
      }

      const response = await this.put<FormData, { identityImageUrl: string }>(
        `/profile/${userProfileID}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to verify identity");
      }

      if (!response.data) {
        throw new Error("No identity image URL returned");
      }

      return response.data.identityImageUrl;
    } catch (error) {
      console.error("Failed to verify identity:", error);
      throw error;
    }
  }
}
