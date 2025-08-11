import { Location, LocationOptions, LocationPayload } from "@/types/Location";
import { ApiResponse, Pagination, Sorting } from "../types/ApiResponse";
import { BaseApiService } from "./baseApiService";

/**
 * Location service for managing location-related API operations
 */
export class LocationService extends BaseApiService {
  /**
   * Fetch locations, optionally filtered by city
   */
  static async fetchLocations(
    options?: LocationOptions,
    pagination?: Pagination,
    sort?: Sorting
  ): Promise<ApiResponse<Location[]>> {
    try {
      const response = await this.get<Location[]>("/locations", {
        params: {
          options,
          ...(pagination ?? BaseApiService.defaultParams.pagination),
          ...(sort ?? BaseApiService.defaultParams.sorting),
        },
      });

      return this.handleApiResponse<Location[]>(response, false);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Search locations by query
   * @param query Search query string
   * @param options Optional search options
   */
  static async searchLocations(
    query: string,
    options?: LocationOptions
  ): Promise<ApiResponse<Location[]>> {
    try {
      const response = await this.get<Location[]>("/locations/search", {
        params: {
          query,
          options,
        },
      });

      return this.handleApiResponse<Location[]>(response, false);
    } catch (error) {
      console.error("Failed to search locations:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
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

      return this.handleApiResponse<Location>(response, true).data;
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
  static async createLocation(
    locationData: LocationPayload
  ): Promise<Location | null> {
    try {
      const response = await this.post<LocationPayload, Location>(
        "/locations",
        locationData
      );

      return this.handleApiResponse<Location>(response, true).data;
    } catch (error) {
      console.error("Failed to create location:", error);
      throw error;
    }
  }
}
