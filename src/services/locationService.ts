import { ApiResponse, isApiResponse } from "@/types/ApiResponse";
import { Location } from "@/types/Location";
import { BaseApiService } from "./baseApiService";

/**
 * Location service for managing location-related API operations
 */
export class LocationService extends BaseApiService {
  /**
   * Fetch locations, optionally filtered by city
   */
  static async fetchLocations(cityId?: string): Promise<Location[]> {
    try {
      const response = await this.get<ApiResponse<Location[]>>("/locations", { 
        params: { cityId } 
      });
      
      // Type guard to ensure we return an array of locations
      if (isApiResponse<Location[]>(response) && response.data) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error("Failed to fetch locations:", error);
      return [];
    }
  }

  /**
   * Search locations by query
   * @param query Search query string
   * @param options Optional search options
   */
  static async searchLocations(
    query: string, 
    options?: { 
      limit?: number; 
      cityId?: string 
    }
  ): Promise<Location[]> {
    try {
      const response = await this.get<ApiResponse<Location[]>>("/locations/search", { 
        params: { 
          query, 
          limit: options?.limit || 5,
          cityId: options?.cityId
        } 
      });
      
      // Type guard to ensure we return an array of locations
      if (isApiResponse<Location[]>(response) && response.data) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error("Failed to search locations:", error);
      return [];
    }
  }

  /**
   * Fetch locations by city
   * @param cityId City's unique identifier
   * @returns Promise resolving to array of locations
   */
  static async fetchLocationsByCity(cityId: string): Promise<Location[]> {
    try {
      const response = await this.get<Location[]>(`/cities/${cityId}/locations`);
      return response.data || []; // Return data from response
    } catch (error) {
      console.error("Failed to fetch locations by city:", error);
      throw error;
    }
  }

  /**
   * Get location by ID
   * @param locationId Location's unique identifier
   * @returns Promise resolving to a location or null
   */
  static async getLocationById(locationId: string): Promise<Location | null> {
    try {
      const response = await this.get<Location>(`/locations/${locationId}`);
      return response.data || null; // Return data from response
    } catch (error) {
      console.error("Failed to get location by ID:", error);
      throw error;
    }
  }

  /**
   * Create a new location
   * @param locationData Location data to create
   * @returns Promise resolving to the created location
   */
  static async createLocation(locationData: Partial<Location>): Promise<Location> {
    try {
      const response = await this.post<Partial<Location>, Location>('/locations', locationData);
      return response.data as Location; // Assert data as Location
    } catch (error) {
      console.error("Failed to create location:", error);
      throw error;
    }
  }

  /**
   * Update an existing location
   * @param locationId Location's unique identifier
   * @param locationData Location data to update
   * @returns Promise resolving to the updated location
   */
  static async updateLocation(
    locationId: string, 
    locationData: Partial<Location>
  ): Promise<Location> {
    try {
      const response = await this.put<Partial<Location>, Location>(`/locations/${locationId}`, locationData);
      return response.data as Location; // Assert data as Location
    } catch (error) {
      console.error("Failed to update location:", error);
      throw error;
    }
  }

  /**
   * Delete a location
   * @param locationId Location's unique identifier
   * @returns Promise resolving to the deletion result
   */
  static async deleteLocation(locationId: string): Promise<boolean> {
    try {
      await this.delete(`/locations/${locationId}`);
      return true;
    } catch (error) {
      console.error("Failed to delete location:", error);
      throw error;
    }
  }

  /**
   * Fetch locations by province
   * @param provinceId Province's unique identifier
   * @returns Promise resolving to array of locations
   */
  static async fetchLocationsByProvince(provinceId: string): Promise<Location[]> {
    try {
      const response = await this.get<Location[]>(`/provinces/${provinceId}/locations`);
      return response.data || []; // Return data from response
    } catch (error) {
      console.error("Failed to fetch locations by province:", error);
      throw error;
    }
  }
} 