/**
 * Application error types and handling utilities
 */

/**
 * Error codes for application errors
 */
export enum ErrorCode {
  // Standard error types
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  AUTH_ERROR = "AUTH_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  CONFIG_ERROR = "CONFIG_ERROR",
  CONFLICT_ERROR = "CONFLICT_ERROR",
  UNAUTHORIZED_ERROR = "UNAUTHORIZED_ERROR",
  BAD_REQUEST_ERROR = "BAD_REQUEST_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  CANCELED_ERROR = "CANCELED_ERROR",
  FORBIDDEN_ERROR = "FORBIDDEN_ERROR",
  METHOD_NOT_ALLOWED_ERROR = "METHOD_NOT_ALLOWED_ERROR",
}

/**
 * Base class for all application errors
 */
export class AppError extends Error {
  /**
   * Unique error type
   */
  type: ErrorCode;

  /**
   * Error details
   */
  details?: any;

  /**
   * Constructor
   * @param params Error parameters
   */
  constructor(params: { message: string; type?: ErrorCode; details?: any }) {
    super(params.message);
    this.name = "AppError";
    this.type = params.type || ErrorCode.INTERNAL_ERROR;
    this.details = params.details;

    // Ensure the prototype chain is properly maintained
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Log error to console
   */
  logError(): void {
    console.error(`[${this.type}] ${this.message}`, {
      details: this.details,
    });
  }
}

/**
 * Parse unknown error into AppError
 * @param error Unknown error
 * @returns AppError instance
 */
export function parseError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError({
      message: error.message,
      type: ErrorCode.INTERNAL_ERROR,
      details: { originalError: error },
    });
  }

  if (typeof error === "string") {
    return new AppError({
      message: error,
      type: ErrorCode.INTERNAL_ERROR,
    });
  }

  return new AppError({
    message: "An unknown error occurred",
    type: ErrorCode.INTERNAL_ERROR,
    details: { originalError: error },
  });
}

/**
 * Check if an error matches a specific error type
 * @param error Error to check
 * @param type Error type to match
 * @returns Whether error matches the type
 */
export function isErrorType(error: unknown, type: ErrorCode): boolean {
  if (error instanceof AppError) {
    return error.type === type;
  }
  return false;
}
