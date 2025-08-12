import {
  ProvinceContext,
  ProvinceContextType,
} from "@/contexts/ProvinceContext";
import notify from "@/services/notificationService";
import { ProvinceService } from "@/services/provinceService";
import { Pagination, Sorting } from "@/types/ApiResponse";
import { Province } from "@/types/Province";
import React, { ReactNode, useCallback, useMemo, useReducer } from "react";
import { createAsyncActions, withAsyncReducer } from "./asyncFactory";

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

function domainReducer(
  state: ProvinceState,
  action: ProvinceAction
): ProvinceState {
  switch (action.type) {
    case "PROVINCE_SUCCESS_PROVINCES": {
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
    }
    case "PROVINCE_APPEND_SUCCESS": {
      const { listType = "default" } = action.payload;
      return {
        ...state,
        isLoading: false,
        ...(listType === "all"
          ? {
              allProvinces: [
                ...state.allProvinces,
                ...action.payload.provinces,
              ],
            }
          : { provinces: [...state.provinces, ...action.payload.provinces] }),
        pagination: action.payload.pagination,
        currentPage: action.payload.pagination?.page || state.currentPage,
        error: null,
      };
    }
    case "PROVINCE_SET_PAGE":
      return { ...state, currentPage: action.payload };
    default:
      return state;
  }
}

const reducer = withAsyncReducer<ProvinceState, ProvinceAction>(
  domainReducer as any,
  initialState
);

export function ProvinceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const asyncActions = createAsyncActions(dispatch);

  const handleError = useCallback(
    (error: unknown, customMessage?: string) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : customMessage || "An unexpected province error occurred";
      asyncActions.error(errorMessage);
      notify.error("Province Error", { message: errorMessage });
    },
    [asyncActions]
  );

  const fetchProvinces = useCallback(
    async (options?: {
      pagination?: Pagination;
      sorting?: Sorting;
      listType?: "default" | "all";
    }): Promise<Province[] | null> => {
      asyncActions.start();
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
      options?: { pagination?: Pagination; listType?: "default" | "all" }
    ): Promise<Province[] | null> => {
      asyncActions.start();
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
      asyncActions.start();
      try {
        const data = await ProvinceService.getProvinceById(provinceId);
        if (data) {
          const exists = state.provinces.some((p) => p.id === data.id);
          dispatch({
            type: "PROVINCE_SUCCESS_PROVINCES",
            payload: {
              provinces: exists
                ? state.provinces.map((p) => (p.id === data.id ? data : p))
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
    (provinceId: string): Province | undefined =>
      state.provinces.find((p) => p.id === provinceId),
    [state.provinces]
  );

  const clearError = useCallback(
    () => asyncActions.clearError(),
    [asyncActions]
  );
  const resetProvinceState = useCallback(
    () => asyncActions.reset(),
    [asyncActions]
  );

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
        (state.pagination?.total && state.pagination?.per_page
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
