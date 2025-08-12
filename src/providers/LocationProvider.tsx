import {
  LocationContext,
  LocationContextType,
} from "@/contexts/LocationContext";
import { LocationService } from "@/services/locationService";
import notify from "@/services/notificationService";
import { Pagination, Sorting } from "@/types/ApiResponse";
import { Location, LocationOptions, LocationPayload } from "@/types/Location";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";
import { createAsyncActions, withAsyncReducer } from "./asyncFactory";

type LocationState = {
  locations: Location[];
  isLoading: boolean;
  error: string | null;
};

type LocationAction = {
  type: "LOCATION_SUCCESS_LOCATIONS";
  payload: Location[];
};

const initialState: LocationState = {
  locations: [],
  isLoading: false,
  error: null,
};

function domainReducer(
  state: LocationState,
  action: LocationAction
): LocationState {
  switch (action.type) {
    case "LOCATION_SUCCESS_LOCATIONS":
      return {
        ...state,
        isLoading: false,
        locations: action.payload,
        error: null,
      };
    default:
      return state;
  }
}

const reducer = withAsyncReducer<LocationState, LocationAction>(
  domainReducer as any,
  initialState
);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const asyncActions = createAsyncActions(dispatch);

  const handleError = useCallback(
    (error: unknown, customMessage?: string) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : customMessage || "An unexpected location error occurred";
      asyncActions.error(errorMessage);
      notify.error("Location Error", { message: errorMessage });
    },
    [asyncActions]
  );

  const fetchLocations = useCallback(
    async (options?: {
      locationOptions?: LocationOptions;
      pagination?: Pagination;
      sorting?: Sorting;
    }): Promise<Location[] | null> => {
      asyncActions.start();
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
      options?: { locationOptions?: LocationOptions; pagination?: Pagination }
    ): Promise<Location[] | null> => {
      asyncActions.start();
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
      asyncActions.start();
      try {
        const data = await LocationService.getLocationById(locationId);
        if (data) {
          const exists = state.locations.some((l) => l.id === data.id);
          dispatch({
            type: "LOCATION_SUCCESS_LOCATIONS",
            payload: exists
              ? state.locations.map((l) => (l.id === data.id ? data : l))
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
    (locationId: string): Location | undefined =>
      state.locations.find((l) => l.id === locationId),
    [state.locations]
  );

  const createLocation = useCallback(
    async (payload: LocationPayload): Promise<Location | null> => {
      asyncActions.start();
      try {
        const data = await LocationService.createLocation(payload);
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

  const clearError = useCallback(
    () => asyncActions.clearError(),
    [asyncActions]
  );
  const resetLocationState = useCallback(
    () => asyncActions.reset(),
    [asyncActions]
  );

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
