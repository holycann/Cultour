import { CityContext, CityContextType } from "@/contexts/CityContext";
import { CityService } from "@/services/cityService";
import { Pagination, Sorting } from "@/types/ApiResponse";
import { City, CityOptions } from "@/types/City";
import { showDialogError } from "@/utils/alert";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";

type CityState = {
  cities: City[];
  allCities: City[];
  homePageCities: City[];
  recommendedCities: City[];
  isLoading: boolean;
  error: string | null;
  pagination?: Pagination;
  currentPage: number;
};

type CityAction =
  | { type: "CITY_START" }
  | {
      type: "CITY_SUCCESS_CITIES";
      payload: {
        cities: City[];
        pagination?: Pagination;
        listType?: "home" | "recommended" | "default" | "all";
      };
    }
  | {
      type: "CITY_APPEND_SUCCESS";
      payload: {
        cities: City[];
        pagination?: Pagination;
        listType?: "home" | "recommended" | "default" | "all";
      };
    }
  | { type: "CITY_ERROR"; payload: string }
  | { type: "CITY_RESET" }
  | { type: "CITY_CLEAR_ERROR" }
  | { type: "CITY_UPDATE_SINGLE"; payload: City }
  | { type: "CITY_SET_PAGE"; payload: number };

const initialState: CityState = {
  cities: [],
  allCities: [],
  homePageCities: [],
  recommendedCities: [],
  isLoading: false,
  error: null,
  pagination: undefined,
  currentPage: 1,
};

function cityReducer(state: CityState, action: CityAction): CityState {
  switch (action.type) {
    case "CITY_START":
      return { ...state, isLoading: true, error: null };
    case "CITY_SUCCESS_CITIES":
      const { listType = "default" } = action.payload;
      return {
        ...state,
        isLoading: false,
        ...(listType === "home"
          ? { homePageCities: action.payload.cities }
          : listType === "recommended"
            ? { recommendedCities: action.payload.cities }
            : listType === "all"
              ? { allCities: action.payload.cities }
              : { cities: action.payload.cities }),
        pagination: action.payload.pagination,
        currentPage: action.payload.pagination?.page || state.currentPage,
        error: null,
      };
    case "CITY_APPEND_SUCCESS":
      const { listType: appendListType = "default" } = action.payload;
      return {
        ...state,
        isLoading: false,
        ...(appendListType === "home"
          ? {
              homePageCities: [
                ...state.homePageCities,
                ...action.payload.cities,
              ],
            }
          : appendListType === "recommended"
            ? {
                recommendedCities: [
                  ...state.recommendedCities,
                  ...action.payload.cities,
                ],
              }
            : appendListType === "all"
              ? { allCities: [...state.allCities, ...action.payload.cities] }
              : { cities: [...state.cities, ...action.payload.cities] }),
        pagination: action.payload.pagination,
        currentPage: action.payload.pagination?.page || state.currentPage,
        error: null,
      };
    case "CITY_SET_PAGE":
      return {
        ...state,
        currentPage: action.payload,
      };
    case "CITY_UPDATE_SINGLE":
      const existingCityIndex = state.cities.findIndex(
        (city) => city.id === action.payload.id
      );
      if (existingCityIndex !== -1) {
        const updatedCities = [...state.cities];
        updatedCities[existingCityIndex] = action.payload;
        return {
          ...state,
          isLoading: false,
          cities: updatedCities,
          error: null,
        };
      } else {
        return {
          ...state,
          isLoading: false,
          cities: [...state.cities, action.payload],
          error: null,
        };
      }
    case "CITY_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "CITY_CLEAR_ERROR":
      return { ...state, error: null };
    case "CITY_RESET":
      return initialState;
    default:
      return state;
  }
}

export function CityProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cityReducer, initialState);

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const errorMessage =
      error instanceof Error
        ? error.message
        : customMessage || "An unexpected city error occurred";

    dispatch({ type: "CITY_ERROR", payload: errorMessage });
    showDialogError("City Error", errorMessage);
  }, []);

  const fetchCities = useCallback(
    async (options?: {
      cityOptions?: CityOptions;
      pagination?: Pagination;
      sorting?: Sorting;
      listType?: "home" | "recommended" | "default" | "all";
    }): Promise<City[] | null> => {
      dispatch({ type: "CITY_START" });

      try {
        const response = await CityService.fetchCities(
          options?.cityOptions,
          options?.pagination,
          options?.sorting
        );

        if (response.success && response.data) {
          dispatch({
            type: "CITY_SUCCESS_CITIES",
            payload: {
              cities: response.data,
              pagination: response.pagination,
              listType: options?.listType,
            },
          });
          return response.data;
        }

        return null;
      } catch (error) {
        handleError(error, "Gagal mengambil daftar kota");
        return null;
      }
    },
    [handleError]
  );

  const searchCities = useCallback(
    async (
      query: string,
      options?: {
        cityOptions?: CityOptions;
        pagination?: Pagination;
        sorting?: Sorting;
        append?: boolean;
        listType?: "home" | "recommended" | "default" | "all";
      }
    ): Promise<City[] | null> => {
      dispatch({ type: "CITY_START" });

      try {
        const response = await CityService.searchCities(
          query,
          options?.cityOptions,
          options?.pagination
        );

        if (response.success && response.data) {
          dispatch({
            type: options?.append
              ? "CITY_APPEND_SUCCESS"
              : "CITY_SUCCESS_CITIES",
            payload: {
              cities: response.data,
              pagination: response.pagination,
              listType: options?.listType,
            },
          });
          return response.data;
        }

        return null;
      } catch (error) {
        handleError(error, "Gagal mencari kota");
        return null;
      }
    },
    [handleError]
  );

  const fetchCityById = useCallback(
    async (cityId: string): Promise<City | null> => {
      dispatch({ type: "CITY_START" });

      try {
        const data = await CityService.getCityById(cityId);

        if (data) {
          dispatch({
            type: "CITY_UPDATE_SINGLE",
            payload: data,
          });
        }

        return data;
      } catch (error) {
        handleError(error, `Gagal mengambil kota dengan ID ${cityId}`);
        return null;
      }
    },
    [handleError]
  );

  const getCityById = useCallback(
    (cityId: string): City | undefined => {
      return state.cities.find((city) => city.id === cityId);
    },
    [state.cities]
  );

  const clearError = useCallback(() => {
    dispatch({ type: "CITY_CLEAR_ERROR" });
  }, []);

  const resetCityState = useCallback(() => {
    dispatch({ type: "CITY_RESET" });
  }, []);

  const contextValue = useMemo<CityContextType>(
    () => ({
      cities: state.cities,
      allCities: state.allCities,
      homePageCities: state.homePageCities,
      recommendedCities: state.recommendedCities,
      isLoading: state.isLoading,
      error: state.error,
      pagination: state.pagination,
      currentPage: state.currentPage,
      totalPages:
        state.pagination?.total_pages ||
        (state.pagination?.total && state.pagination.per_page
          ? Math.max(
              1,
              Math.ceil(state.pagination.total / state.pagination.per_page)
            )
          : 1),
      hasMoreCities:
        state.pagination?.has_next_page ||
        (state.pagination?.total_pages
          ? state.currentPage < state.pagination.total_pages
          : (state.pagination?.total || 0) > (state.cities.length || 0)),
      fetchCities,
      searchCities,
      fetchCityById,
      getCityById,
      clearError,
      resetCityState,
    }),
    [
      state.cities,
      state.allCities,
      state.homePageCities,
      state.recommendedCities,
      state.isLoading,
      state.error,
      state.pagination,
      state.currentPage,
      fetchCities,
      searchCities,
      fetchCityById,
      getCityById,
      clearError,
      resetCityState,
    ]
  );

  return (
    <CityContext.Provider value={contextValue}>{children}</CityContext.Provider>
  );
}
