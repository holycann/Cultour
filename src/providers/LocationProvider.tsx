import {
  LocationContext,
  LocationContextType,
} from "@/contexts/LocationContext";
import { LocationService } from "@/services/locationService";
import { Pagination, Sorting } from "@/types/ApiResponse";
import { Location, LocationOptions, LocationPayload } from "@/types/Location";
import { showDialogError } from "@/utils/alert";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";

type LocationState = {
  locations: Location[];
  isLoading: boolean;
  error: string | null;
};

type LocationAction =
  | { type: "LOCATION_START" }
  | { type: "LOCATION_SUCCESS_LOCATIONS"; payload: Location[] }
  | { type: "LOCATION_ERROR"; payload: string }
  | { type: "LOCATION_CLEAR_ERROR" }
  | { type: "LOCATION_RESET" };

const initialState: LocationState = {
  locations: [],
  isLoading: false,
  error: null,
};

function locationReducer(
  state: LocationState,
  action: LocationAction
): LocationState {
  switch (action.type) {
    case "LOCATION_START":
      return { ...state, isLoading: true, error: null };
    case "LOCATION_SUCCESS_LOCATIONS":
      return {
        ...state,
        isLoading: false,
        locations: action.payload,
        error: null,
      };
    case "LOCATION_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "LOCATION_CLEAR_ERROR":
      return { ...state, error: null };
    case "LOCATION_RESET":
      return initialState;
    default:
      return state;
  }
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(locationReducer, initialState);

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const errorMessage =
      error instanceof Error
        ? error.message
        : customMessage || "An unexpected location error occurred";

    dispatch({ type: "LOCATION_ERROR", payload: errorMessage });
    showDialogError("Location Error", errorMessage);
  }, []);

  const fetchLocations = useCallback(
    async (options?: {
      locationOptions?: LocationOptions;
      pagination?: Pagination;
      sorting?: Sorting;
    }): Promise<Location[] | null> => {
      dispatch({ type: "LOCATION_START" });

      try {
        const response = await LocationService.fetchLocations(
          options?.locationOptions,
          options?.pagination,
          options?.sorting
        );

        if (response.success && response.data) {
          dispatch({
            type: "LOCATION_SUCCESS_LOCATIONS",
            payload: response.data,
          });
          return response.data;
        }

        return null;
      } catch (error) {
        handleError(error, "Gagal mengambil daftar lokasi");
        return null;
      }
    },
    [handleError]
  );

  const searchLocations = useCallback(
    async (
      query: string,
      options?: {
        locationOptions?: LocationOptions;
        pagination?: Pagination;
      }
    ): Promise<Location[] | null> => {
      dispatch({ type: "LOCATION_START" });

      try {
        const response = await LocationService.searchLocations(
          query,
          options?.locationOptions
        );

        if (response.success && response.data) {
          dispatch({
            type: "LOCATION_SUCCESS_LOCATIONS",
            payload: response.data,
          });
          return response.data;
        }

        return null;
      } catch (error) {
        handleError(error, "Gagal mencari lokasi");
        return null;
      }
    },
    [handleError]
  );

  const fetchLocationById = useCallback(
    async (locationId: string): Promise<Location | null> => {
      dispatch({ type: "LOCATION_START" });

      try {
        const data = await LocationService.getLocationById(locationId);

        if (data) {
          // Optimistically update local state
          dispatch({
            type: "LOCATION_SUCCESS_LOCATIONS",
            payload: state.locations.some((loc) => loc.id === data.id)
              ? state.locations.map((loc) => (loc.id === data.id ? data : loc))
              : [...state.locations, data],
          });
        }

        return data;
      } catch (error) {
        handleError(error, `Gagal mengambil lokasi dengan ID ${locationId}`);
        return null;
      }
    },
    [handleError, state.locations]
  );

  const getLocationById = useCallback(
    (locationId: string): Location | undefined => {
      return state.locations.find((loc) => loc.id === locationId);
    },
    [state.locations]
  );

  const createLocation = useCallback(
    async (locationData: LocationPayload): Promise<Location | null> => {
      dispatch({ type: "LOCATION_START" });

      try {
        const data = await LocationService.createLocation(locationData);

        if (data) {
          dispatch({
            type: "LOCATION_SUCCESS_LOCATIONS",
            payload: [...state.locations, data],
          });
        }

        return data;
      } catch (error) {
        handleError(error, "Gagal membuat lokasi");
        return null;
      }
    },
    [handleError, state.locations]
  );

  const clearError = useCallback(() => {
    dispatch({ type: "LOCATION_CLEAR_ERROR" });
  }, []);

  const resetLocationState = useCallback(() => {
    dispatch({ type: "LOCATION_RESET" });
  }, []);

  const contextValue = useMemo<LocationContextType>(
    () => ({
      locations: state.locations,
      isLoading: state.isLoading,
      error: state.error,
      fetchLocations,
      searchLocations,
      fetchLocationById,
      getLocationById,
      createLocation,
      clearError,
      resetLocationState,
    }),
    [
      state.locations,
      state.isLoading,
      state.error,
      fetchLocations,
      searchLocations,
      fetchLocationById,
      getLocationById,
      createLocation,
      clearError,
      resetLocationState,
    ]
  );

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}
