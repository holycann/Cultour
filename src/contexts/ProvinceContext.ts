import { Pagination, Sorting } from "@/types/ApiResponse";
import { Province } from "@/types/Province";
import { createContext } from "react";

/**
 * Province context type definition with enhanced methods and error handling
 */
export interface ProvinceContextType {
  provinces: Province[];
  allProvinces: Province[];
  isLoading: boolean;
  error: string | null;
  pagination?: Pagination;
  currentPage: number;
  hasMoreProvinces: boolean;
  totalPages?: number;

  // Province Fetching Methods
  fetchProvinces: (options?: {
    pagination?: Pagination;
    sorting?: Sorting;
    listType?: "default" | "all";
  }) => Promise<Province[] | null>;

  searchProvinces: (
    query: string,
    options?: {
      pagination?: Pagination;
      listType?: "default" | "all";
    }
  ) => Promise<Province[] | null>;

  // Province Lookup Methods
  fetchProvinceById: (provinceId: string) => Promise<Province | null>;
  getProvinceById: (provinceId: string) => Province | undefined;

  // State Management Methods
  clearError: () => void;
  resetProvinceState: () => void;
}

/**
 * Create the context with a undefined default value
 */
export const ProvinceContext = createContext<ProvinceContextType | undefined>(
  undefined
);
