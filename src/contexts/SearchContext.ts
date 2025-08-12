import { Pagination } from "@/types/ApiResponse";
import { SearchRequest, SearchResult } from "@/types/Search";
import { createContext } from "react";

export interface SearchContextType {
  searchResults: SearchResult[];
  isSearching: boolean;
  error: string | null;

  // Search Methods
  performSearch: (
    request: SearchRequest,
    options?: {
      pagination?: Pagination;
    }
  ) => Promise<SearchResult[] | null>;

  // State Management Methods
  clearSearch: () => void;
  resetSearchState: () => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(
  undefined
);
