import { ApiResponse, Pagination, Sorting } from "@/types/ApiResponse";
import { City, CityOptions } from "@/types/City";
import { BaseApiService } from "./baseApiService";

/**
 * City service for managing city-related API operations
 */
export class CityService extends BaseApiService {
  /**
   * Fetch cities with optional filtering and pagination
   * @param options Optional filtering and pagination parameters
   */
  static async fetchCities(
    options?: CityOptions,
    pagination?: Pagination,
    sort?: Sorting
  ): Promise<ApiResponse<City[]>> {
    try {
      const response = await this.get<City[]>("/cities", {
        params: {
          options,
          ...(pagination ?? BaseApiService.defaultParams.pagination),
          ...(sort ?? BaseApiService.defaultParams.sorting),
        },
      });

      return this.handleApiResponse<City[]>(response, false);
    } catch (error) {
      console.error("Failed to fetch cities:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Search cities by query
   * @param query Search query string
   * @param options Optional search options
   */
  static async searchCities(
    query: string,
    options?: CityOptions,
    pagination?: Pagination
  ): Promise<ApiResponse<City[]>> {
    try {
      const response = await this.get<City[]>("/cities/search", {
        params: {
          query,
          options,
          pagination,
        },
      });

      return this.handleApiResponse<City[]>(response, false);
    } catch (error) {
      console.error("Failed to search cities:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
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

      return this.handleApiResponse<City>(response, true).data;
    } catch (error) {
      console.error("Failed to get city by ID:", error);
      throw error;
    }
  }
}
