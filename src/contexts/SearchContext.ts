import { SearchRequest, SearchResult } from "@/types/Search";
import { createContext } from "react";

export interface SearchContextType {
  searchResults: SearchResult[];
  isSearching: boolean;
  error: string | null;
  performSearch: (request: SearchRequest) => Promise<void>;
  clearSearch: () => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(
  undefined
); 