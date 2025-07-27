import { Location } from "@/types/Location";
import { createContext } from "react";

/**
 * Location context type definition
 */
export interface LocationContextType {
  locations: Location[];
  isLoading: boolean;
  error: string | null;
  fetchLocations: (cityId?: string) => Promise<void>;
  getLocationById: (locationId: string) => Location | undefined;
  clearError: () => void;
}

/**
 * Create the context with a undefined default value
 */
export const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);
