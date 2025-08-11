import {
  ProvinceContext,
  ProvinceContextType,
} from "@/contexts/ProvinceContext";
import { ProvinceService } from "@/services/provinceService";
import { Pagination, Sorting } from "@/types/ApiResponse";
import { Province } from "@/types/Province";
import { showDialogError } from "@/utils/alert";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";

type ProvinceState = {
  provinces: Province[];
  allProvinces: Province[];
  isLoading: boolean;
  error: string | null;
  pagination?: Pagination;
  currentPage: number;
  hasMoreProvinces: boolean;
};

type ProvinceAction =
  | { type: "PROVINCE_START" }
  | {
      type: "PROVINCE_SUCCESS_PROVINCES";
      payload: {
        provinces: Province[];
        pagination?: Pagination;
        listType?: "default" | "all";
      };
    }
  | {
      type: "PROVINCE_APPEND_SUCCESS";
      payload: {
        provinces: Province[];
        pagination?: Pagination;
        listType?: "default" | "all";
      };
    }
  | { type: "PROVINCE_ERROR"; payload: string }
  | { type: "PROVINCE_CLEAR_ERROR" }
  | { type: "PROVINCE_RESET" }
  | { type: "PROVINCE_SET_PAGE"; payload: number };

const initialState: ProvinceState = {
  provinces: [],
  allProvinces: [],
  isLoading: false,
  error: null,
  pagination: undefined,
  currentPage: 1,
  hasMoreProvinces: false,
};

function provinceReducer(
  state: ProvinceState,
  action: ProvinceAction
): ProvinceState {
  switch (action.type) {
    case "PROVINCE_START":
      return { ...state, isLoading: true, error: null };
    case "PROVINCE_SUCCESS_PROVINCES":
      const { listType = "default" } = action.payload;
      return {
        ...state,
        isLoading: false,
        ...(listType === "all"
          ? { allProvinces: action.payload.provinces }
          : { provinces: action.payload.provinces }),
        pagination: action.payload.pagination,
        currentPage: action.payload.pagination?.page || state.currentPage,
        error: null,
      };
    case "PROVINCE_APPEND_SUCCESS":
      const { listType: appendListType = "default" } = action.payload;
      return {
        ...state,
        isLoading: false,
        ...(appendListType === "all"
          ? { allProvinces: [...state.allProvinces, ...action.payload.provinces] }
          : { provinces: [...state.provinces, ...action.payload.provinces] }),
        pagination: action.payload.pagination,
        currentPage: action.payload.pagination?.page || state.currentPage,
        error: null,
      };
    case "PROVINCE_SET_PAGE":
      return {
        ...state,
        currentPage: action.payload,
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

export function ProvinceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(provinceReducer, initialState);

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const errorMessage =
      error instanceof Error
        ? error.message
        : customMessage || "An unexpected province error occurred";

    dispatch({ type: "PROVINCE_ERROR", payload: errorMessage });
    showDialogError("Province Error", errorMessage);
  }, []);

  const fetchProvinces = useCallback(
    async (options?: {
      pagination?: Pagination;
      sorting?: Sorting;
      listType?: "default" | "all";
    }): Promise<Province[] | null> => {
      dispatch({ type: "PROVINCE_START" });

      try {
        const response = await ProvinceService.fetchProvinces(
          options?.pagination,
          options?.sorting
        );

        if (response.success && response.data) {
          dispatch({
            type: "PROVINCE_SUCCESS_PROVINCES",
            payload: {
              provinces: response.data,
              pagination: response.pagination,
              listType: options?.listType,
            },
          });
          return response.data;
        }

        return null;
      } catch (error) {
        handleError(error, "Gagal mengambil daftar provinsi");
        return null;
      }
    },
    [handleError]
  );

  const searchProvinces = useCallback(
    async (
      query: string,
      options?: {
        pagination?: Pagination;
        listType?: "default" | "all";
      }
    ): Promise<Province[] | null> => {
      dispatch({ type: "PROVINCE_START" });

      try {
        const response = await ProvinceService.searchProvinces(query);

        if (response.success && response.data) {
          dispatch({
            type: "PROVINCE_SUCCESS_PROVINCES",
            payload: {
              provinces: response.data,
              pagination: response.pagination,
              listType: options?.listType,
            },
          });
          return response.data;
        }

        return null;
      } catch (error) {
        handleError(error, "Gagal mencari provinsi");
        return null;
      }
    },
    [handleError]
  );

  const fetchProvinceById = useCallback(
    async (provinceId: string): Promise<Province | null> => {
      dispatch({ type: "PROVINCE_START" });

      try {
        const data = await ProvinceService.getProvinceById(provinceId);

        if (data) {
          // Optimistically update local state
          dispatch({
            type: "PROVINCE_SUCCESS_PROVINCES",
            payload: {
              provinces: state.provinces.some((prov) => prov.id === data.id)
                ? state.provinces.map((prov) =>
                    prov.id === data.id ? data : prov
                  )
                : [...state.provinces, data],
              listType: "default",
            },
          });
        }

        return data;
      } catch (error) {
        handleError(error, `Gagal mengambil provinsi dengan ID ${provinceId}`);
        return null;
      }
    },
    [handleError, state.provinces]
  );

  const getProvinceById = useCallback(
    (provinceId: string): Province | undefined => {
      return state.provinces.find((prov) => prov.id === provinceId);
    },
    [state.provinces]
  );

  const clearError = useCallback(() => {
    dispatch({ type: "PROVINCE_CLEAR_ERROR" });
  }, []);

  const resetProvinceState = useCallback(() => {
    dispatch({ type: "PROVINCE_RESET" });
  }, []);

  const contextValue = useMemo<ProvinceContextType>(
    () => ({
      provinces: state.provinces,
      allProvinces: state.allProvinces,
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
      hasMoreProvinces:
        state.pagination?.has_next_page ||
        (state.pagination?.total_pages
          ? state.currentPage < state.pagination.total_pages
          : (state.pagination?.total || 0) > (state.provinces.length || 0)),
      fetchProvinces,
      searchProvinces,
      fetchProvinceById,
      getProvinceById,
      clearError,
      resetProvinceState,
    }),
    [
      state.provinces,
      state.allProvinces,
      state.isLoading,
      state.error,
      state.pagination,
      state.currentPage,
      fetchProvinces,
      searchProvinces,
      fetchProvinceById,
      getProvinceById,
      clearError,
      resetProvinceState,
    ]
  );

  return (
    <ProvinceContext.Provider value={contextValue}>
      {children}
    </ProvinceContext.Provider>
  );
}
