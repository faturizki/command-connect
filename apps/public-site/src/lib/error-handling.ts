/**
 * Error handling utilities for routes
 * Provides consistent error handling patterns across the application
 */

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  isError: true;
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
}

/**
 * Wraps an async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options?: {
    fallbackMessage?: string;
    onError?: (error: Error) => void;
  },
): Promise<T | ErrorResponse> {
  try {
    return await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error(message, error);

    if (options?.onError && error instanceof Error) {
      options.onError(error);
    }

    return {
      isError: true,
      message: options?.fallbackMessage || message || "An error occurred",
      details: error instanceof Error ? { originalError: error.message } : undefined,
    };
  }
}

/**
 * Checks if a response is an error response
 */
export function isErrorResponse(data: any): data is ErrorResponse {
  return data && typeof data === "object" && data.isError === true;
}

/**
 * Extracts user-friendly error message
 */
export function getErrorMessage(error: unknown, defaultMessage: string = "An error occurred"): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as any).message);
  }
  return defaultMessage;
}

/**
 * Handles Supabase errors with user-friendly messages
 */
export function handleSupabaseError(error: any, lang: "id" | "en" = "id"): string {
  const errorCode = error?.code;
  const errorMessage = error?.message || "";

  // Map common Supabase error codes to user-friendly messages
  const errorMap: Record<string, Record<"id" | "en", string>> = {
    PGRST116: {
      id: "Data tidak ditemukan.",
      en: "Data not found.",
    },
    "42P01": {
      id: "Tabel tidak ditemukan (error database).",
      en: "Table not found (database error).",
    },
    "23505": {
      id: "Data duplikat. Sudah ada record dengan nilai yang sama.",
      en: "Duplicate data. A record with this value already exists.",
    },
    "23503": {
      id: "Referensi data tidak valid.",
      en: "Invalid data reference.",
    },
  };

  // Check if we have a mapped error
  if (errorCode && errorCode in errorMap) {
    return errorMap[errorCode][lang];
  }

  // Check for network errors
  if (errorMessage.includes("Network") || errorMessage.includes("Failed to fetch")) {
    return lang === "id"
      ? "Koneksi jaringan gagal. Periksa koneksi internet Anda."
      : "Network connection failed. Please check your internet connection.";
  }

  // Check for authentication errors
  if (errorMessage.includes("unauthorized") || errorMessage.includes("401")) {
    return lang === "id"
      ? "Anda tidak memiliki otorisasi untuk melakukan tindakan ini."
      : "You are not authorized to perform this action.";
  }

  // Generic fallback
  return lang === "id"
    ? "Terjadi kesalahan. Silakan coba lagi."
    : "An error occurred. Please try again.";
}

/**
 * Creates a formatted error message for logging
 */
export function formatErrorLog(
  context: string,
  error: any,
  additionalInfo?: Record<string, any>,
): string {
  const timestamp = new Date().toISOString();
  const errorMessage = getErrorMessage(error);
  const infoStr = additionalInfo ? ` | ${JSON.stringify(additionalInfo)}` : "";
  return `[${timestamp}] ${context}: ${errorMessage}${infoStr}`;
}
