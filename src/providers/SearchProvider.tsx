import { SearchContext, SearchContextType } from "@/contexts/SearchContext";
import notify from "@/services/notificationService";
import { SearchService } from "@/services/searchService";
import { Pagination } from "@/types/ApiResponse";
import { SearchRequest, SearchResult } from "@/types/Search";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";
import { createAsyncActions, withAsyncReducer } from "./asyncFactory";

type SearchState = {
  searchResults: SearchResult[];
  isLoading: boolean;
  error: string | null;
};

type SearchAction =
  | { type: "SEARCH_SUCCESS"; payload: SearchResult[] }
  | { type: "SEARCH_CLEAR" };

const initialState: SearchState = {
  searchResults: [],
  isLoading: false,
  error: null,
};

function domainReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "SEARCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        searchResults: action.payload,
        error: null,
      };
    case "SEARCH_CLEAR":
      return { ...state, searchResults: [], error: null };
    default:
      return state;
  }
}

const reducer = withAsyncReducer<SearchState, SearchAction>(domainReducer as any, initialState);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const asyncActions = createAsyncActions(dispatch);

  const handleError = useCallback(
    (error: unknown, customMessage?: string) => {
      const errorMessage = error instanceof Error ? error.message : customMessage || "An unexpected search error occurred";
      asyncActions.error(errorMessage);
      notify.error("Search Error", { message: errorMessage });
    },
    [asyncActions]
  );

  const performSearch = useCallback(
    async (
      request: SearchRequest,
      options?: {
        pagination?: Pagination;
      }
    ): Promise<SearchResult[] | null> => {
      asyncActions.start();

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

  const clearError = useCallback(() => {
    asyncActions.clearError();
  }, [asyncActions]);

  const resetSearchState = useCallback(() => {
    asyncActions.reset();
  }, [asyncActions]);

  const contextValue = useMemo<SearchContextType>(
    () => ({
      searchResults: state.searchResults,
      isSearching: state.isLoading,
      error: state.error,
      performSearch,
      clearSearch,
      clearError,
      resetSearchState,
    }),
    [
      state.searchResults,
      state.isLoading,
      state.error,
      performSearch,
      clearSearch,
      clearError,
      resetSearchState,
    ]
  );

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}