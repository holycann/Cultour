import { ApiResponse, Pagination, Sorting } from "@/types/ApiResponse";
import { Badge, UserBadge } from "@/types/Badge";
import { BaseApiService } from "./baseApiService";

/**
 * Badge service for managing badge-related API operations
 */
export class BadgeService extends BaseApiService {
  /**
   * Fetch available badges (paginated)
   */
  static async fetchBadges(
    pagination?: Pagination,
    sort?: Sorting
  ): Promise<ApiResponse<Badge[]>> {
    try {
      const response = await this.get<Badge[]>("/badges", {
        params: {
          ...(pagination ?? BaseApiService.defaultParams.pagination),
          ...(sort ?? BaseApiService.defaultParams.sorting),
        },
      });

      return this.handleApiResponse<Badge[]>(response, false);
    } catch (error) {
      console.error("Failed to fetch badges:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Fetch badges for a specific user
   * @param userId User's unique identifier
   * @returns Promise resolving to array of user badges
   */
  static async fetchUserBadges(
    pagination?: Pagination,
    sort?: Sorting
  ): Promise<ApiResponse<UserBadge[]>> {
    try {
      const response = await this.get<UserBadge[]>(`/users/badges`, {
        params: {
          ...(pagination ?? BaseApiService.defaultParams.pagination),
          ...(sort ?? BaseApiService.defaultParams.sorting),
        },
      });

      return this.handleApiResponse<UserBadge[]>(response, false);
    } catch (error) {
      console.error("Failed to fetch user badges:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
