import { Pagination, Sorting } from "@/types/ApiResponse";
import { City, CityOptions } from "@/types/City";
import { createContext } from "react";

/**
 * City context type definition with enhanced methods and error handling
 */
export interface CityContextType {
  homePageCities: City[];
  recommendedCities: City[];
  cities: City[];
  allCities: City[];
  isLoading: boolean;
  error: string | null;
  pagination?: Pagination;
  currentPage: number;
  totalPages?: number;
  hasMoreCities: boolean;

  // City Fetching Methods
  fetchCities: (options?: {
    cityOptions?: CityOptions;
    pagination?: Pagination;
    sorting?: Sorting;
    listType?: "home" | "recommended" | "default" | "all";
  }) => Promise<City[] | null>;

  searchCities: (
    query: string,
    options?: {
      cityOptions?: CityOptions;
      pagination?: Pagination;
      sorting?: Sorting;
      append?: boolean;
      listType?: "home" | "recommended" | "default" | "all";
    }
  ) => Promise<City[] | null>;

  // City Lookup Methods
  fetchCityById: (cityId: string) => Promise<City | null>;
  getCityById: (cityId: string) => City | undefined;

  // State Management Methods
  clearError: () => void;
  resetCityState: () => void;
}

/**
 * Create the context with a undefined default value
 */
export const CityContext = createContext<CityContextType | undefined>(
  undefined
);
