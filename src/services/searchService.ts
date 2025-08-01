import { SearchRequest, SearchResult } from "@/types/Search";
import { BaseApiService } from "./baseApiService";
import { CityService } from "./cityService";
import { EventService } from "./eventService";
import { LocationService } from "./locationService";
import { ProvinceService } from "./provinceService";

export class SearchService extends BaseApiService {
  /**
   * Perform a global search across multiple entities
   * @param request Search request parameters
   * @returns Promise resolving to search results
   */
  static async globalSearch(request: SearchRequest): Promise<SearchResult[]> {
    try {
      const searchResults: SearchResult[] = [];

      // Default to all types if not specified
      const searchTypes = request.types || [
        "event",
        "city",
        "province",
        "location",
      ];

      // Perform searches based on specified types
      if (searchTypes.includes("event")) {
        const events = await EventService.searchEvents(request.query, {
          limit: request.limit || 5,
        });
        searchResults.push(
          ...events.map((event) => ({
            type: "event" as const,
            data: event,
            relevanceScore: 1, // Backend can provide actual relevance if needed
          }))
        );
      }

      if (searchTypes.includes("city")) {
        const cities = await CityService.searchCities(request.query, {
          limit: request.limit || 5,
        });
        searchResults.push(
          ...cities.map((city) => ({
            type: "city" as const,
            data: city,
            relevanceScore: 1,
          }))
        );
      }

      if (searchTypes.includes("province")) {
        const provinces = await ProvinceService.searchProvinces(request.query, {
          limit: request.limit || 5,
        });
        searchResults.push(
          ...provinces.map((province) => ({
            type: "province" as const,
            data: province,
            relevanceScore: 1,
          }))
        );
      }

      if (searchTypes.includes("location")) {
        const locations = await LocationService.searchLocations(request.query, {
          limit: request.limit || 5,
        });
        searchResults.push(
          ...locations.map((location) => ({
            type: "location" as const,
            data: location,
            relevanceScore: 1,
          }))
        );
      }

      // Sort results by relevance score (descending)
      return searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      console.error("Global search failed:", error);
      return [];
    }
  }
}
