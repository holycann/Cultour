import { SearchContext, SearchContextType } from "@/contexts/SearchContext";
import { useContext } from "react";

export function useSearch(): SearchContextType {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }

  return context;
}
