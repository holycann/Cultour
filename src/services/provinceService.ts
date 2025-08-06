import { ApiResponse, isApiResponse } from "@/types/ApiResponse";
import { Province } from "@/types/Province";
import { BaseApiService } from "./baseApiService";

/**
 * Province service for managing province-related API operations
 */
export class ProvinceService extends BaseApiService {
  /**
   * Fetch all provinces
   * @returns Promise resolving to array of provinces
   */
  static async fetchProvinces(options?: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<Province[]> {
    try {
      const response = await this.get<ApiResponse<Province[]>>("/provinces", {
        params: {
          limit: options?.limit || 10,
          offset: options?.offset || 0,
          sort_by: options?.sortBy || "created_at",
          sort_order: options?.sortOrder || "desc",
        },
      });

      // Type guard to ensure we return an array of provinces
      if (isApiResponse<Province[]>(response) && response.data) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error("Failed to fetch provinces:", error);
      return [];
    }
  }

  /**
   * Search provinces by query
   * @param query Search query string
   * @param options Optional search options
   */
  static async searchProvinces(
    query: string,
    options?: {
      limit?: number;
    }
  ): Promise<Province[]> {
    try {
      const response = await this.get<ApiResponse<Province[]>>(
        "/provinces/search",
        {
          params: {
            query,
            limit: options?.limit || 5,
          },
        }
      );

      // Type guard to ensure we return an array of provinces
      if (isApiResponse<Province[]>(response) && response.data) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error("Failed to search provinces:", error);
      return [];
    }
  }

  /**
   * Get province by ID
   * @param provinceId Province's unique identifier
   * @returns Promise resolving to a province or null
   */
  static async getProvinceById(provinceId: string): Promise<Province | null> {
    try {
      const response = await this.get<Province>(`/provinces/${provinceId}`);

      if (!response.success) {
        throw new Error(response.error || "Failed to get province by ID");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to get province by ID:", error);
      throw error;
    }
  }

  /**
   * Fetch provinces by region
   * @param regionId Region's unique identifier
   * @returns Promise resolving to array of provinces
   */
  static async fetchProvincesByRegion(regionId: string): Promise<Province[]> {
    try {
      const response = await this.get<Province[]>(
        `/regions/${regionId}/provinces`
      );

      if (!response.success) {
        throw new Error(
          response.error || "Failed to fetch provinces by region"
        );
      }

      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch provinces by region:", error);
      throw error;
    }
  }
}
