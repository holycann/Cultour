import { ApiResponse, isApiResponse } from "@/types/ApiResponse";
import { City } from "@/types/City";
import { BaseApiService } from "./baseApiService";

/**
 * City service for managing city-related API operations
 */
export class CityService extends BaseApiService {
  /**
   * Fetch cities, optionally filtered by province
   */
  static async fetchCities(provinceId?: string): Promise<City[]> {
    try {
      const response = await this.get<ApiResponse<City[]>>("/cities", { 
        params: { provinceId } 
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
      provinceId?: string 
    }
  ): Promise<City[]> {
    try {
      const response = await this.get<ApiResponse<City[]>>("/cities/search", { 
        params: { 
          query, 
          limit: options?.limit || 5,
          provinceId: options?.provinceId
        } 
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
   * Fetch cities by province ID
   * @param provinceId Province's unique identifier
   * @returns Promise resolving to array of cities
   */
  static async fetchCitiesByProvince(provinceId: string): Promise<City[]> {
    try {
      const response = await this.get<City[]>(
        `/provinces/${provinceId}/cities`
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch cities by province");
      }

      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch cities by province:", error);
      throw error;
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

  /**
   * Create a new city
   * @param cityData City data to create
   * @returns Promise resolving to the created city
   */
  static async createCity(cityData: Partial<City>): Promise<City> {
    try {
      const response = await this.post<Partial<City>, City>(
        "/cities",
        cityData
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to create city");
      }

      if (!response.data) {
        throw new Error("No city data returned");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to create city:", error);
      throw error;
    }
  }

  /**
   * Update an existing city
   * @param cityId City's unique identifier
   * @param cityData City data to update
   * @returns Promise resolving to the updated city
   */
  static async updateCity(
    cityId: string,
    cityData: Partial<City>
  ): Promise<City> {
    try {
      const response = await this.put<Partial<City>, City>(
        `/cities/${cityId}`,
        cityData
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to update city");
      }

      if (!response.data) {
        throw new Error("No updated city data returned");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to update city:", error);
      throw error;
    }
  }

  /**
   * Delete a city
   * @param cityId City's unique identifier
   * @returns Promise resolving to the deletion result
   */
  static async deleteCity(cityId: string): Promise<boolean> {
    try {
      const response = await this.delete(`/cities/${cityId}`);

      if (!response.success) {
        throw new Error(response.error || "Failed to delete city");
      }

      return true;
    } catch (error) {
      console.error("Failed to delete city:", error);
      throw error;
    }
  }
}
