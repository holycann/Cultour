import { ApiResponse } from "@/types/ApiResponse";
import { logger } from "@/utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

/**
 * BaseApiService
 *
 * Kode ini sudah cukup sesuai dengan dokumentasi swagger.json backend:
 * - Semua endpoint di swagger.json menggunakan JWT di header Authorization (tanpa prefix 'Bearer '),
 *   namun di sini menggunakan 'Bearer ' di depan token.
 *   Jika backend TIDAK menggunakan prefix 'Bearer ', maka bagian ini perlu diubah.
 * - Semua endpoint menerima dan mengembalikan response dengan struktur mirip ApiResponse<T>.
 * - Semua endpoint menggunakan Content-Type: application/json.
 * - Error handling sudah mengembalikan struktur mirip ApiResponse<T> sesuai error response backend.
 *
 * Catatan:
 * - Jika backend TIDAK menggunakan prefix 'Bearer ' pada Authorization,
 *   maka config.headers.Authorization = token; (tanpa 'Bearer ')!
 * - Jika ada kebutuhan mengirim multipart/form-data, header Content-Type perlu diubah di method terkait.
 */

export class BaseApiService {
  private static axiosInstance: AxiosInstance | null = null;

  protected static getAxiosInstance(): AxiosInstance {
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
            // Cek dokumentasi swagger.json:
            // Semua endpoint pakai header Authorization: JWT Token (tanpa 'Bearer ')
            // Jadi, jika backend TIDAK pakai 'Bearer ', ganti baris di bawah menjadi:
            // config.headers.Authorization = token;
            config.headers.Authorization = token; // TANPA 'Bearer ' prefix
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

  private static handleError<T>(error: any): ApiResponse<T> {
    if (error.response && error.response.data) {
      const errorData = error.response.data;
      const errorResponse: ApiResponse<T> = {
        success: false,
        message: errorData.message || "An error occurred",
        data: null,
        error: errorData.error || "An unknown error occurred",
        details: errorData.details || null,
        metadata: errorData.metadata,
      };
      logger.error("BaseApiService", "API Error", {
        error: errorResponse.error,
        details: errorResponse.details,
      });
      return errorResponse;
    }
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
