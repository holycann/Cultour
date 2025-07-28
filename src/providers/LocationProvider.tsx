import { supabase } from "@/config/supabase";
import { LocationContext } from '@/contexts/LocationContext';
import { parseError } from "@/types/AppError";
import { Location } from '@/types/Location';
import { showDialogError } from "@/utils/alert";
import React, { ReactNode, useCallback, useMemo, useReducer } from 'react';

/**
 * Location state type for reducer
 */
interface LocationState {
  locations: Location[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Location action types for reducer
 */
type LocationAction =
  | { type: "LOCATION_START" }
  | { type: "LOCATION_SUCCESS_LOCATIONS"; payload: Location[] }
  | { type: "LOCATION_ERROR"; payload: string }
  | { type: "LOCATION_CLEAR_ERROR" }
  | { type: "LOCATION_RESET" };

/**
 * Initial location state
 */
const initialState: LocationState = {
  locations: [],
  isLoading: false,
  error: null,
};

/**
 * Reducer function for location state management
 */
function locationReducer(state: LocationState, action: LocationAction): LocationState {
  switch (action.type) {
    case "LOCATION_START":
      return { ...state, isLoading: true, error: null };
    case "LOCATION_SUCCESS_LOCATIONS":
      return { ...state, isLoading: false, locations: action.payload, error: null };
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

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [state, dispatch] = useReducer(locationReducer, initialState);

  /**
   * Handle any API errors
   */
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const appError = parseError(error);
    const errorMessage = customMessage || appError.message;

    dispatch({ type: "LOCATION_ERROR", payload: errorMessage });
    showDialogError("Error", errorMessage);
  }, []);

  /**
   * Fetch locations, optionally filtered by city
   */
  const fetchLocations = useCallback(async (cityId?: string) => {
    dispatch({ type: "LOCATION_START" });

    try {
      let query = supabase.from('locations').select('*');
      
      if (cityId) {
        query = query.eq('city_id', cityId);
      }

      const { data, error } = await query;

      if (error) throw error;

      dispatch({ 
        type: "LOCATION_SUCCESS_LOCATIONS", 
        payload: data || [] 
      });
    } catch (error) {
      handleError(error, "Gagal mengambil daftar lokasi");
    }
  }, [handleError]);

  /**
   * Get location by ID
   */
  const getLocationById = useCallback((locationId: string) => {
    return state.locations.find(loc => loc.id === locationId);
  }, [state.locations]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    dispatch({ type: "LOCATION_CLEAR_ERROR" });
  }, []);

  /**
   * Context value
   */
  const value = useMemo(
    () => ({
      locations: state.locations,
      isLoading: state.isLoading,
      error: state.error,
      fetchLocations,
      getLocationById,
      clearError,
    }),
    [
      state.locations,
      state.isLoading,
      state.error,
      fetchLocations,
      getLocationById,
      clearError,
    ]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
} 