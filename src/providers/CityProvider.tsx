import { CityContext, CityContextType } from "@/contexts/CityContext";
import { CityService } from "@/services/cityService";
import { parseError } from "@/types/AppError";
import { City } from "@/types/City";
import { showDialogError } from "@/utils/alert";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";

/**
 * City state type for reducer
 */
interface CityState {
  cities: City[];
  isLoading: boolean;
  error: string | null;
}

/**
 * City action types for reducer
 */
type CityAction =
  | { type: "CITY_START" }
  | { type: "CITY_SUCCESS"; payload: City[] }
  | { type: "CITY_ERROR"; payload: string }
  | { type: "CITY_CLEAR_ERROR" }
  | { type: "CITY_RESET" }
  | { type: "CITY_UPDATE_SINGLE"; payload: City };

/**
 * Initial city state
 */
const initialState: CityState = {
  cities: [],
  isLoading: false,
  error: null,
};

/**
 * Reducer function for city state management
 */
function cityReducer(state: CityState, action: CityAction): CityState {
  switch (action.type) {
    case "CITY_START":
      return { ...state, isLoading: true, error: null };
    case "CITY_SUCCESS":
      return {
        ...state,
        isLoading: false,
        cities: action.payload,
        error: null,
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

interface CityProviderProps {
  children: ReactNode;
}

export function CityProvider({ children }: CityProviderProps) {
  const [state, dispatch] = useReducer(cityReducer, initialState);

  /**
   * Handle any API errors
   */
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const appError = parseError(error);
    const errorMessage = customMessage || appError.message;

    dispatch({ type: "CITY_ERROR", payload: errorMessage });
    showDialogError("Error", errorMessage);
  }, []);

  /**
   * Fetch all cities
   */
  const fetchCities = useCallback(
    async (options?: {
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      provinceId?: string;
    }) => {
      dispatch({ type: "CITY_START" });

      try {
        const data = await CityService.fetchCities(options);

        dispatch({
          type: "CITY_SUCCESS",
          payload: data,
        });
      } catch (error) {
        handleError(error, "Gagal mengambil daftar kota");
      }
    },
    [handleError]
  );

  /**
   * Fetch a city by its ID
   */
  const fetchCityById = useCallback(
    async (cityId: string) => {
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

  /**
   * Get city by ID
   */
  const getCityById = useCallback(
    (cityId: string) => {
      return state.cities.find((city) => city.id === cityId);
    },
    [state.cities]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    dispatch({ type: "CITY_CLEAR_ERROR" });
  }, []);

  /**
   * Context value
   */
  const value = useMemo(
    (): CityContextType => ({
      cities: state.cities,
      isLoading: state.isLoading,
      fetchCities,
      fetchCityById,
      getCityById,
      clearError,
      error: state.error,
    }),
    [
      state.cities,
      state.isLoading,
      fetchCities,
      fetchCityById,
      getCityById,
      clearError,
      state.error,
    ]
  );

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}
