import { ProvinceContext } from "@/contexts/ProvinceContext";
import { ProvinceService } from "@/services/provinceService";
import { parseError } from "@/types/AppError";
import { Province } from "@/types/Province";
import { showDialogError } from "@/utils/alert";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";

/**
 * Province state type for reducer
 */
interface ProvinceState {
  provinces: Province[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Province action types for reducer
 */
type ProvinceAction =
  | { type: "PROVINCE_START" }
  | { type: "PROVINCE_SUCCESS_PROVINCES"; payload: Province[] }
  | { type: "PROVINCE_ERROR"; payload: string }
  | { type: "PROVINCE_CLEAR_ERROR" }
  | { type: "PROVINCE_RESET" };

/**
 * Initial province state
 */
const initialState: ProvinceState = {
  provinces: [],
  isLoading: false,
  error: null,
};

/**
 * Reducer function for province state management
 */
function provinceReducer(
  state: ProvinceState,
  action: ProvinceAction
): ProvinceState {
  switch (action.type) {
    case "PROVINCE_START":
      return { ...state, isLoading: true, error: null };
    case "PROVINCE_SUCCESS_PROVINCES":
      return {
        ...state,
        isLoading: false,
        provinces: action.payload,
        error: null,
      };
    case "PROVINCE_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "PROVINCE_CLEAR_ERROR":
      return { ...state, error: null };
    case "PROVINCE_RESET":
      return initialState;
    default:
      return state;
  }
}

interface ProvinceProviderProps {
  children: ReactNode;
}

export function ProvinceProvider({ children }: ProvinceProviderProps) {
  const [state, dispatch] = useReducer(provinceReducer, initialState);

  /**
   * Handle any API errors
   */
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const appError = parseError(error);
    const errorMessage = customMessage || appError.message;

    dispatch({ type: "PROVINCE_ERROR", payload: errorMessage });
    showDialogError("Error", errorMessage);
  }, []);

  /**
   * Fetch all provinces
   */
  const fetchProvinces = useCallback(
    async (options?: {
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }) => {
      dispatch({ type: "PROVINCE_START" });

      try {
        const data = await ProvinceService.fetchProvinces(options);

        dispatch({
          type: "PROVINCE_SUCCESS_PROVINCES",
          payload: data,
        });
      } catch (error) {
        handleError(error, "Gagal mengambil daftar provinsi");
      }
    },
    [handleError]
  );

  /**
   * Get province by ID
   */
  const getProvinceById = useCallback(
    (provinceId: string) => {
      return state.provinces.find((prov) => prov.id === provinceId);
    },
    [state.provinces]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    dispatch({ type: "PROVINCE_CLEAR_ERROR" });
  }, []);

  /**
   * Context value
   */
  const value = useMemo(
    () => ({
      provinces: state.provinces,
      isLoading: state.isLoading,
      error: state.error,
      fetchProvinces,
      getProvinceById,
      clearError,
    }),
    [
      state.provinces,
      state.isLoading,
      state.error,
      fetchProvinces,
      getProvinceById,
      clearError,
    ]
  );

  return (
    <ProvinceContext.Provider value={value}>
      {children}
    </ProvinceContext.Provider>
  );
}
