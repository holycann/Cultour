import {
  UpdateAvatar,
  UpdateIdentity,
  UserProfile,
  UserProfilePayload,
} from "@/types/UserProfile";
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
    userProfileData: UserProfilePayload
  ): Promise<UserProfile | null> {
    try {
      const response = await this.post<UserProfilePayload, UserProfile>(
        "/users/profiles",
        userProfileData
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to create user profile");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to create user profile:", error);
      throw error;
    }
  }

  /**
   * Get authenticated user profile
   * @returns Promise resolving to user profile or null
   */
  static async getUserProfile(): Promise<UserProfile | null> {
    try {
      const response = await this.get<UserProfile>(`/users/profiles/me`);

      return this.handleApiResponse<UserProfile>(response, false).data;
    } catch (error) {
      console.error("Failed to get user profile:", error);
      return null;
    }
  }

  /**
   * Update user profile
   * @param profileId User Profile's unique identifier
   * @param profileData Full user profile data to update
   * @returns Promise resolving to updated user profile or null
   */
  static async updateProfile(
    profileData: UserProfilePayload
  ): Promise<UserProfilePayload | null> {
    try {
      const response = await this.put<UserProfilePayload>(
        `/users/profiles/${profileData.id}`,
        profileData
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to update user profile");
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
  static async uploadAvatar(payload: UpdateAvatar): Promise<string | null> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      // Only support React Native or web File
      if (payload.image) {
        if ("uri" in payload.image) {
          formData.append("avatar", {
            uri: payload.image.uri,
            type: getFileType(payload.image.uri),
            name: payload.image.name || "avatar.jpg",
          } as any);
        } else {
          formData.append("avatar", payload.image);
        }
      } else {
        throw new Error("No image provided for avatar upload");
      }

      const response = await this.put<FormData, UpdateAvatar>(
        `/users/profiles/${payload.id}/avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to upload avatar");
      }

      if (!response.data) {
        throw new Error("No avatar URL returned");
      }

      return response.data.avatar_url as string;
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
  static async verifyIdentity(payload: UpdateIdentity): Promise<string | null> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      // Only support React Native or web File
      if (payload.image) {
        if ("uri" in payload.image) {
          formData.append("identity_image", {
            uri: payload.image.uri,
            type: getFileType(payload.image.uri),
            name: payload.image.name || "identity.jpg",
          } as any);
        } else {
          formData.append("identity_image", payload.image);
        }
      } else {
        throw new Error("No image provided for identity verification");
      }

      const response = await this.put<FormData, UpdateIdentity>(
        `/users/profiles/${payload.id}/verify`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to verify identity");
      }

      if (!response.data) {
        throw new Error("No identity image URL returned");
      }

      return response.data.identity_image_url as string;
    } catch (error) {
      console.error("Failed to verify identity:", error);
      throw error;
    }
  }
}
