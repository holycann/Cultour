import { ApiResponse, Pagination, Sorting } from "@/types/ApiResponse";
import { Province } from "@/types/Province";
import { BaseApiService } from "./baseApiService";

/**
 * Province service for managing province-related API operations
 */
export class ProvinceService extends BaseApiService {
  /**
   * Fetch all provinces
   */
  static async fetchProvinces(
    pagination?: Pagination,
    sort?: Sorting
  ): Promise<ApiResponse<Province[]>> {
    try {
      const response = await this.get<Province[]>("/provinces", {
        params: {
          ...(pagination ?? BaseApiService.defaultParams.pagination),
          ...(sort ?? BaseApiService.defaultParams.sorting),
        },
      });

      return this.handleApiResponse<Province[]>(response, false);
    } catch (error) {
      console.error("Failed To Fetch Province:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Search provinces by query
   */
  static async searchProvinces(
    query: string
  ): Promise<ApiResponse<Province[]>> {
    try {
      const response = await this.get<Province[]>("/provinces/search", {
        params: {
          query,
        },
      });

      return this.handleApiResponse<Province[]>(response, false);
    } catch (error) {
      console.error("Failed To Search Province:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get province by ID
   */
  static async getProvinceById(provinceId: string): Promise<Province | null> {
    try {
      const response = await this.get<Province>(`/provinces/${provinceId}`);

      return this.handleApiResponse<Province>(response, true).data;
    } catch (error) {
      console.error("Failed to get province by ID:", error);
      throw error;
    }
  }
}
