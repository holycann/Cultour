import { City } from "@/types/City";
import { createContext } from "react";

/**
 * City context type definition
 */
export interface CityContextType {
  cities: City[];
  isLoading: boolean;
  fetchCities: (options?: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    provinceId?: string;
  }) => Promise<void>;
  fetchCityById: (cityId: string) => Promise<City | null>;
  getCityById: (cityId: string) => City | undefined;
  clearError: () => void;
  error: string | null;
}

/**
 * Create the context with a undefined default value
 */
export const CityContext = createContext<CityContextType | undefined>(
  undefined
);
