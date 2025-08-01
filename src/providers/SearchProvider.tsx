import { SearchContext, SearchContextType } from "@/contexts/SearchContext";
import { SearchService } from "@/services/searchService";
import { parseError } from "@/types/AppError";
import { SearchRequest, SearchResult } from "@/types/Search";
import { showDialogError } from "@/utils/alert";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";

interface SearchState {
  searchResults: SearchResult[];
  isSearching: boolean;
  error: string | null;
}

type SearchAction =
  | { type: "SEARCH_START" }
  | { type: "SEARCH_SUCCESS"; payload: SearchResult[] }
  | { type: "SEARCH_ERROR"; payload: string }
  | { type: "SEARCH_CLEAR" };

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
    default:
      return state;
  }
}

interface SearchProviderProps {
  children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  const handleError = useCallback((error: unknown) => {
    const appError = parseError(error);
    const errorMessage = appError.message;

    dispatch({ type: "SEARCH_ERROR", payload: errorMessage });
    showDialogError("Search Error", errorMessage);
  }, []);

  const performSearch = useCallback(
    async (request: SearchRequest) => {
      dispatch({ type: "SEARCH_START" });

      try {
        const results = await SearchService.globalSearch(request);

        dispatch({
          type: "SEARCH_SUCCESS",
          payload: results,
        });
      } catch (error) {
        handleError(error);
      }
    },
    [handleError]
  );

  const clearSearch = useCallback(() => {
    dispatch({ type: "SEARCH_CLEAR" });
  }, []);

  const value: SearchContextType = useMemo(
    () => ({
      searchResults: state.searchResults,
      isSearching: state.isSearching,
      error: state.error,
      performSearch,
      clearSearch,
    }),
    [
      state.searchResults,
      state.isSearching,
      state.error,
      performSearch,
      clearSearch,
    ]
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}
