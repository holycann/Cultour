import { Province } from "@/types/Province";
import { createContext } from "react";

/**
 * Province context type definition
 */
export interface ProvinceContextType {
  provinces: Province[];
  isLoading: boolean;
  error: string | null;
  fetchProvinces: () => Promise<void>;
  getProvinceById: (provinceId: string) => Province | undefined;
  clearError: () => void;
}

/**
 * Create the context with a undefined default value
 */
export const ProvinceContext = createContext<ProvinceContextType | undefined>(
  undefined
);
