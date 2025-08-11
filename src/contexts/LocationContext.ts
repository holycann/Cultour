import { Pagination, Sorting } from "@/types/ApiResponse";
import { Location, LocationOptions, LocationPayload } from "@/types/Location";
import { createContext } from "react";

/**
 * Location context type definition with enhanced methods and error handling
 */
export interface LocationContextType {
  locations: Location[];
  isLoading: boolean;
  error: string | null;

  // Location Fetching Methods
  fetchLocations: (options?: {
    locationOptions?: LocationOptions;
    pagination?: Pagination;
    sorting?: Sorting;
  }) => Promise<Location[] | null>;

  searchLocations: (
    query: string, 
    options?: {
      locationOptions?: LocationOptions;
      pagination?: Pagination;
    }
  ) => Promise<Location[] | null>;

  // Location Lookup Methods
  fetchLocationById: (locationId: string) => Promise<Location | null>;
  getLocationById: (locationId: string) => Location | undefined;
  
  // Location Creation Methods
  createLocation: (locationData: LocationPayload) => Promise<Location | null>;

  // State Management Methods
  clearError: () => void;
  resetLocationState: () => void;
}

/**
 * Create the context with a undefined default value
 */
export const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);
