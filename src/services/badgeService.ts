import { Badge, UserBadge } from "@/types/Badge";
import { BaseApiService } from './baseApiService';

/**
 * Badge service for managing badge-related API operations
 */
export class BadgeService extends BaseApiService {
  /**
   * Fetch all available badges
   * @returns Promise resolving to array of badges
   */
  static async fetchBadges(): Promise<Badge[]> {
    try {
      const response = await this.get<Badge[]>('/badges');
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch badges');
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch badges:", error);
      throw error;
    }
  }

  /**
   * Fetch badges for a specific user
   * @param userId User's unique identifier
   * @returns Promise resolving to array of user badges
   */
  static async fetchUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      const response = await this.get<UserBadge[]>(`/users/${userId}/badges`);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch user badges');
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch user badges:", error);
      throw error;
    }
  }

  /**
   * Add a badge to a user
   * @param userId User's unique identifier
   * @param badgeId Badge's unique identifier
   * @returns Promise resolving to the added user badge
   */
  static async addBadgeToUser(
    userId: string, 
    badgeId: string
  ): Promise<UserBadge> {
    try {
      const response = await this.post<{ userId: string; badgeId: string }, UserBadge>(
        `/users/${userId}/badges`, 
        { userId, badgeId }
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to add badge to user');
      }
      
      if (!response.data) {
        throw new Error('No user badge data returned');
      }
      
      return response.data;
    } catch (error) {
      console.error("Failed to add badge to user:", error);
      throw error;
    }
  }
}
