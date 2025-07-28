/**
 * Pagination metadata for paginated responses
 */
export interface Pagination {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next_page: boolean;
}

/**
 * Standard API response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  metadata?: {
    pagination?: Pagination;
    [key: string]: any;
  };
  data: T | null;
  error?: string;
  details?: any;
}

/**
 * Type guard to check if the response is a successful API response
 */
export function isApiResponse<T>(response: any): response is ApiResponse<T> {
  return response && 
         typeof response.success === 'boolean' && 
         response.success === true;
}

/**
 * Type guard to check if the response is an error API response
 */
export function isApiErrorResponse<T>(response: any): response is ApiResponse<T> {
  return response && 
         typeof response.success === 'boolean' && 
         response.success === false;
}

/**
 * Utility function to handle API responses
 */
export function handleApiResponse<T>(
  response: ApiResponse<T>, 
  onSuccess?: (data: T) => void, 
  onError?: (error: string, details?: any) => void
) {
  if (response.success && response.data) {
    onSuccess?.(response.data);
  } else {
    onError?.(
      response.error || 'An unknown error occurred', 
      response.details
    );
  }
}
