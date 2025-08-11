import {
  ApiResponse,
  isApiResponse,
  Pagination,
  Sorting,
} from "@/types/ApiResponse";
import { logger } from "@/utils/logger";
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { AuthService } from "./authService";

export class BaseApiService {
  // Single static axios instance for all services
  private static axiosInstance: AxiosInstance | null = null;

  protected static defaultParams = {
    pagination: {
      per_page: 10,
      page: 1,
    } as Pagination,
    sorting: {
      sort_by: "created_at",
      sort_order: "desc",
    } as Sorting,
  };

  /**
   * Get the configured axios instance
   */
  protected static getAxiosInstance(): AxiosInstance {
    // Initialize axios if not already initialized
    if (!this.axiosInstance) {
      this.axiosInstance = axios.create({
        baseURL:
          process.env.EXPO_PUBLIC_API_URL ||
          process.env.EXPO_PUBLIC_ANDROID_API_URL ||
          "http://localhost:8181",
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
        },
      });

      this.axiosInstance.interceptors.request.use(
        async (config: InternalAxiosRequestConfig) => {
          try {
            const token = await AuthService.getAuthToken();

            if (token) {
              config.headers.Authorization = `Bearer ${token}`;

              await AuthService.setAuthToken(token);
            }
          } catch (error) {
            logger.error("BaseApiService", "Token Retrieval Error", error);
          }
          return config;
        },
        (error) => {
          logger.error("BaseApiService", "API Request Error", error);
          return Promise.reject(error);
        }
      );

      // Response interceptor for logging and error handling
      this.axiosInstance.interceptors.response.use(
        (response: AxiosResponse) => {
          return response;
        },
        async (error) => {
          logger.error("BaseApiService", "API Response Error", error);

          // Check for invalid/expired token (401/403)
          if (
            error.response &&
            (error.response.status === 401 || error.response.status === 403)
          ) {
            try {
              // Attempt to refresh token
              const newToken = await AuthService.getAuthToken();
              if (newToken) {
                await AuthService.setAuthToken(newToken);
              }
            } catch (refreshError) {
              logger.error(
                "BaseApiService",
                "Token Refresh Error",
                refreshError
              );
            }
          }

          return Promise.reject(error);
        }
      );
    }
    return this.axiosInstance;
  }

  /**
   * handle request, retry if token expired, and error handling
   * @param fn Axios request function (get, post, put, delete)
   * @param args Arguments for the axios function
   * @param retryArgs Optional: arguments for retry (for post/put)
   */
  private static async requestWithRetry<T>(
    fn: (...args: any[]) => Promise<AxiosResponse<ApiResponse<T>>>,
    args: any[],
    retryArgs?: any[]
  ): Promise<ApiResponse<T>> {
    try {
      // Do the request
      const response = await fn(...args);
      return this.normalizeResponse<T>(response.data);
    } catch (error: any) {
      // If error is invalid token, try to refresh token and retry once
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        try {
          const newToken = await AuthService.getAuthToken();

          if (newToken) {
            await AuthService.setAuthToken(newToken);
            // Retry the request with new token
            const retryResponse = await fn(...(retryArgs ?? args));
            return this.normalizeResponse<T>(retryResponse.data);
          }
        } catch (refreshError) {
          // Log refresh error with context
          logger.error(
            "BaseApiService",
            `Token Refresh Error (${fn.name.toUpperCase()})`,
            refreshError
          );
        }
      }
      // Handle error in a unified way
      return this.handleError<T>(error);
    }
  }

  /**
   * Perform GET request
   * @param url Endpoint URL
   * @param config Optional axios request configuration
   * @returns Promise with response data
   */
  protected static async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>(this.getAxiosInstance().get, [url, config]);
  }

  /**
   * Perform POST request
   * @param url Endpoint URL
   * @param data Request payload
   * @param config Optional axios request configuration
   * @returns Promise with response data
   */
  protected static async post<T, R = T>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<R>> {
    return this.requestWithRetry<R>(this.getAxiosInstance().post, [
      url,
      data,
      config,
    ]);
  }

  /**
   * Perform PUT request
   * @param url Endpoint URL
   * @param data Request payload
   * @param config Optional axios request configuration
   * @returns Promise with response data
   */
  protected static async put<T, R = T>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<R>> {
    return this.requestWithRetry<R>(this.getAxiosInstance().put, [
      url,
      data,
      config,
    ]);
  }

  /**
   * Perform DELETE request
   * @param url Endpoint URL
   * @param config Optional axios request configuration
   * @returns Promise with response data
   */
  protected static async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>(this.getAxiosInstance().delete, [
      url,
      config,
    ]);
  }

  private static normalizeResponse<T>(data: any): ApiResponse<T> {
    // Ensure consistent ApiResponse shape and surface top-level pagination
    const pagination = data?.pagination || data?.metadata?.pagination;
    return {
      success: Boolean(data?.success ?? (data?.error ? false : true)),
      message: data?.message,
      pagination,
      data: (data?.data ?? null) as T | null,
      error: undefined,
    };
  }

  /**
   * Handle API response with option to throw or fallback
   */
  protected static handleApiResponse<T>(
    response: any,
    throwOnError: boolean = false
  ): ApiResponse<T> {
    if (isApiResponse<T>(response)) {
      return response;
    }

    if (throwOnError) {
      throw new Error(response?.message);
    }

    return {
      success: false,
      data: null,
      error: response?.message,
    };
  }

  private static handleError<T>(error: any): ApiResponse<T> {
    // Check if error response follows backend error structure
    if (error.response && error.response.data) {
      const errorData = error.response.data;
      const message: string =
        errorData?.message || errorData?.error?.details || "An error occurred";
      const structuredDetails = errorData?.error || {
        code: errorData?.error?.code,
        details: errorData?.error?.details,
      };

      const errorResponse: ApiResponse<T> = {
        success: false,
        message,
        data: null,
        error: structuredDetails,
      };

      // Log the error
      logger.error("BaseApiService", "API Error", errorResponse);

      return errorResponse;
    }

    // Network or other errors
    const networkMessage = error?.message || "An unexpected error occurred";
    const networkErrorResponse: ApiResponse<T> = {
      success: false,
      message: networkMessage,
      data: null,
      error: networkMessage,
    };

    logger.error("BaseApiService", "Network Error", networkMessage);

    return networkErrorResponse;
  }
}
