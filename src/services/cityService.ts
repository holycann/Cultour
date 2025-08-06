import { ApiResponse, isApiResponse } from "@/types/ApiResponse";
import { City } from "@/types/City";
import { BaseApiService } from "./baseApiService";

/**
 * City service for managing city-related API operations
 */
export class CityService extends BaseApiService {
  /**
   * Fetch cities with optional filtering and pagination
   * @param options Optional filtering and pagination parameters
   */
  static async fetchCities(options?: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    provinceId?: string;
  }): Promise<City[]> {
    try {
      const response = await this.get<ApiResponse<City[]>>("/cities", {
        params: {
          limit: options?.limit || 10,
          offset: options?.offset || 0,
          sort_by: options?.sortBy || "created_at",
          sort_order: options?.sortOrder || "desc",
          province_id: options?.provinceId,
        },
      });

      // Type guard to ensure we return an array of cities
      if (isApiResponse<City[]>(response) && response.data) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error("Failed to fetch cities:", error);
      return [];
    }
  }

  /**
   * Search cities by query
   * @param query Search query string
   * @param options Optional search options
   */
  static async searchCities(
    query: string,
    options?: {
      limit?: number;
      provinceId?: string;
    }
  ): Promise<City[]> {
    try {
      const response = await this.get<ApiResponse<City[]>>("/cities/search", {
        params: {
          query,
          limit: options?.limit || 5,
          province_id: options?.provinceId,
        },
      });

      // Type guard to ensure we return an array of cities
      if (isApiResponse<City[]>(response) && response.data) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error("Failed to search cities:", error);
      return [];
    }
  }

  /**
   * Get city by ID
   * @param cityId City's unique identifier
   * @returns Promise resolving to a city or null
   */
  static async getCityById(cityId: string): Promise<City | null> {
    try {
      const response = await this.get<City>(`/cities/${cityId}`);

      if (!response.success) {
        throw new Error(response.error || "Failed to get city by ID");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to get city by ID:", error);
      throw error;
    }
  }
}
