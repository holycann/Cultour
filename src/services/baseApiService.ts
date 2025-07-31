import { ApiResponse } from "@/types/ApiResponse";
import { logger } from "@/utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

      console.log("Base URL:", this.axiosInstance.defaults.baseURL);

      // Request interceptor for adding auth token
      this.axiosInstance.interceptors.request.use(
        async (config: InternalAxiosRequestConfig) => {
          try {
            // Always get the latest token from AuthService (single source of truth)
            let token = await AuthService.getAuthToken();

            if (token) {
              // Cache token in AsyncStorage for fallback (optional, but not as source of truth)
              await AsyncStorage.setItem("userToken", token);
              config.headers.Authorization = `Bearer ${token}`;
            } else {
              // Fallback: try to get from AsyncStorage if AuthService fails
              token = await AsyncStorage.getItem("userToken");
              if (token) {
                config.headers.Authorization = `Bearer ${token}`;
              }
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
          logger.log("BaseApiService", "API Response", {
            url: response.config.url,
            method: response.config.method,
            status: response.status,
          });
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
                await AsyncStorage.setItem("userToken", newToken);
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
      return response.data;
    } catch (error: any) {
      // If error is invalid token, try to refresh token and retry once
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        try {
          const newToken = await AuthService.getAuthToken();
          if (newToken) {
            await AsyncStorage.setItem("userToken", newToken);
            // Retry the request with new token
            const retryResponse = await fn(...(retryArgs ?? args));
            return retryResponse.data;
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
    // Use DRY helper for GET
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
    // Use DRY helper for DELETE
    return this.requestWithRetry<T>(this.getAxiosInstance().delete, [
      url,
      config,
    ]);
  }

  /**
   * Error handling method
   */
  private static handleError<T>(error: any): ApiResponse<T> {
    // Check if error response follows backend error structure
    if (error.response && error.response.data) {
      const errorData = error.response.data;

      // Ensure the error response matches ApiResponse structure
      const errorResponse: ApiResponse<T> = {
        success: false,
        message: errorData.message || "An error occurred",
        data: null,
        error: errorData.error || "An unknown error occurred",
        details: errorData.details || null,
        metadata: errorData.metadata,
      };

      // Log the error
      logger.error("BaseApiService", "API Error", {
        error: errorResponse.error,
        details: errorResponse.details,
      });

      return errorResponse;
    }

    // Network or other errors
    const networkErrorResponse: ApiResponse<T> = {
      success: false,
      message: "Network error",
      data: null,
      error: error.message || "An unexpected error occurred",
      details: error,
    };

    logger.error("BaseApiService", "Network Error", networkErrorResponse.error);

    return networkErrorResponse;
  }
}
