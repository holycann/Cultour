import { SearchRequest, SearchResult } from "@/types/Search";
import { BaseApiService } from "./baseApiService";
import { CityService } from "./cityService";
import { EventService } from "./eventService";

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
      const searchTypes = request.types || ["event", "place"];

      // Perform searches based on specified types
      if (searchTypes.includes("event")) {
        const events = await EventService.searchEvents(
          request.query,
          {},
          {
            per_page: 5,
          }
        );

        if (events?.data) {
          searchResults.push(
            ...events.data.map((event) => ({
              type: "event" as const,
              data: event,
            }))
          );
        }
      }

      if (searchTypes.includes("place")) {
        const cities = await CityService.searchCities(request.query, {});

        if (cities?.data) {
          searchResults.push(
            ...cities.data.map((city) => ({
              type: "place" as const,
              data: city,
              relevanceScore: 1,
            }))
          );
        }
      }

      return searchResults;
    } catch (error) {
      console.error("Global search failed:", error);
      return [];
    }
  }
}
