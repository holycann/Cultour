import { User, UserProfile } from "@/types/User";
import { BaseApiService } from "./baseApiService";

/**
 * User service for managing user-related API operations
 */
export class UserService extends BaseApiService {
  /**
   * Get user by ID
   * @param userId User's unique identifier
   * @returns Promise resolving to User or null
   */
  static async getUser(userId: string): Promise<User | null> {
    try {
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
   * Get user profile by user ID
   * @param userId User's unique identifier
   * @returns Promise resolving to user profile or null
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await this.get<UserProfile>(`/profile/${userId}`);

      if (!response.success) {
        throw new Error(response.error || "Failed to get user profile");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to get user profile:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param userId User's unique identifier
   * @param profileData Partial user profile data to update
   * @returns Promise resolving to updated user profile or null
   */
  static async updateProfile(
    userId: string,
    profileData: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    try {
      const response = await this.put<Partial<UserProfile>, UserProfile>(
        `/profile/${userId}`,
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
   * @param userId User's unique identifier
   * @param avatarFile File to upload
   * @returns Promise resolving to avatar URL or null
   */
  static async uploadAvatar(
    userId: string,
    avatarFile: File | { uri: string; type?: string; name?: string }
  ): Promise<string | null> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("avatar", {
        uri: 'uri' in avatarFile ? avatarFile.uri : avatarFile.webkitRelativePath,
        type: 'type' in avatarFile ? avatarFile.type : avatarFile.type,
        name: 'name' in avatarFile ? avatarFile.name : avatarFile.name,
      } as any);

      const response = await this.post<FormData, { avatarUrl: string }>(
        `/profile/${userId}/avatar`,
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
}
