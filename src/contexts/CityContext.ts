import { City } from "@/types/City";
import { createContext } from "react";

/**
 * City context type definition
 */
export interface CityContextType {
  cities: City[];
  isLoading: boolean;
  error: string | null;
  fetchCities: () => Promise<void>;
  getCityById: (cityId: string) => City | undefined;
  clearError: () => void;
}

/**
 * Create the context with a undefined default value
 */
export const CityContext = createContext<CityContextType | undefined>(
  undefined
);
