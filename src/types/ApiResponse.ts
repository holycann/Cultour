/**
 * Pagination metadata for paginated responses
 */
export interface Pagination {
  total?: number;
  page?: number;
  per_page?: number;
  total_pages?: number;
  has_next_page?: boolean;
}

export interface Sorting {
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface ApiError {
  code?: string;
  details?: string;
}

/**
 * Standard API response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T | null;
  pagination?: Pagination;
  error?: ApiError | string;
}

/**
 * Type guard to check if the response is a successful API response
 */
export function isApiResponse<T>(response: any): response is ApiResponse<T> {
  return (
    response &&
    typeof response.success === "boolean" &&
    response.success === true
  );
}
