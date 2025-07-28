import { ApiResponse } from "@/types/ApiResponse";
import { logger } from "@/utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

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
        baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8181",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Request interceptor for adding auth token
      this.axiosInstance.interceptors.request.use(
        async (config: InternalAxiosRequestConfig) => {
          const token = await AsyncStorage.getItem("userToken");
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          logger.log("BaseApiService", "API Request", {
            url: config.url,
            method: config.method,
            headers: config.headers,
          });
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
            data: response.data,
          });
          return response;
        },
        (error) => {
          logger.error("BaseApiService", "API Response Error", error);
          return Promise.reject(error);
        }
      );
    }
    return this.axiosInstance;
  }

  /**
   * Generic GET method
   */
  protected static async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.getAxiosInstance().get<ApiResponse<T>>(
        url,
        config
      );

      return response.data;
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Generic POST method
   */
  protected static async post<T, R = T>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<R>> {
    try {
      const response = await this.getAxiosInstance().post<ApiResponse<R>>(
        url,
        data,
        config
      );

      return response.data;
    } catch (error: any) {
      return this.handleError<R>(error);
    }
  }

  /**
   * Generic PUT method
   */
  protected static async put<T, R = T>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<R>> {
    try {
      const response = await this.getAxiosInstance().put<ApiResponse<R>>(
        url,
        data,
        config
      );

      return response.data;
    } catch (error: any) {
      return this.handleError<R>(error);
    }
  }

  /**
   * Generic DELETE method
   */
  protected static async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.getAxiosInstance().delete<ApiResponse<T>>(
        url,
        config
      );

      return response.data;
    } catch (error: any) {
      return this.handleError<T>(error);
    }
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
