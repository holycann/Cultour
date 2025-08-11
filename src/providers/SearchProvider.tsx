import { SearchContext, SearchContextType } from "@/contexts/SearchContext";
import { SearchService } from "@/services/searchService";
import { Pagination } from "@/types/ApiResponse";
import { SearchRequest, SearchResult } from "@/types/Search";
import { showDialogError } from "@/utils/alert";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";

type SearchState = {
  searchResults: SearchResult[];
  isSearching: boolean;
  error: string | null;
};

type SearchAction =
  | { type: "SEARCH_START" }
  | { type: "SEARCH_SUCCESS"; payload: SearchResult[] }
  | { type: "SEARCH_ERROR"; payload: string }
  | { type: "SEARCH_CLEAR" }
  | { type: "SEARCH_RESET" };

const initialState: SearchState = {
  searchResults: [],
  isSearching: false,
  error: null,
};

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "SEARCH_START":
      return { ...state, isSearching: true, error: null };
    case "SEARCH_SUCCESS":
      return {
        ...state,
        isSearching: false,
        searchResults: action.payload,
        error: null,
      };
    case "SEARCH_ERROR":
      return { ...state, isSearching: false, error: action.payload };
    case "SEARCH_CLEAR":
      return { ...state, searchResults: [], error: null };
    case "SEARCH_RESET":
      return initialState;
    default:
      return state;
  }
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const errorMessage =
      error instanceof Error
        ? error.message
        : customMessage || "An unexpected search error occurred";

    dispatch({ type: "SEARCH_ERROR", payload: errorMessage });
    showDialogError("Search Error", errorMessage);
  }, []);

  const performSearch = useCallback(
    async (
      request: SearchRequest,
      options?: {
        pagination?: Pagination;
      }
    ): Promise<SearchResult[] | null> => {
      dispatch({ type: "SEARCH_START" });

      try {
        const results = await SearchService.globalSearch(request);

        dispatch({
          type: "SEARCH_SUCCESS",
          payload: results,
        });

        return results;
      } catch (error) {
        handleError(error, "Gagal melakukan pencarian");
        return null;
      }
    },
    [handleError]
  );

  const clearSearch = useCallback(() => {
    dispatch({ type: "SEARCH_CLEAR" });
  }, []);

  const resetSearchState = useCallback(() => {
    dispatch({ type: "SEARCH_RESET" });
  }, []);

  const contextValue = useMemo<SearchContextType>(
    () => ({
      searchResults: state.searchResults,
      isSearching: state.isSearching,
      error: state.error,
      performSearch,
      clearSearch,
      resetSearchState,
    }),
    [
      state.searchResults,
      state.isSearching,
      state.error,
      performSearch,
      clearSearch,
      resetSearchState,
    ]
  );

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}