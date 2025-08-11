export type BackendErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "INTERNAL_ERROR"
  | "AUTH_ERROR"
  | "AUTHORIZATION_ERROR"
  | "DATABASE_ERROR"
  | "NETWORK_ERROR"
  | "CONFIG_ERROR"
  | "CONFLICT_ERROR"
  | "UNAUTHORIZED_ERROR"
  | "BAD_REQUEST_ERROR"
  | "TIMEOUT_ERROR"
  | "CANCELED_ERROR"
  | "FORBIDDEN_ERROR"
  | "METHOD_NOT_ALLOWED_ERROR";

const messages: Record<BackendErrorCode, string> = {
  VALIDATION_ERROR: "Data tidak valid. Periksa kembali input Anda.",
  NOT_FOUND: "Data tidak ditemukan.",
  INTERNAL_ERROR: "Terjadi kesalahan pada server.",
  AUTH_ERROR: "Silakan login untuk melanjutkan.",
  AUTHORIZATION_ERROR: "Anda tidak memiliki izin untuk melakukan aksi ini.",
  DATABASE_ERROR: "Terjadi kesalahan pada basis data.",
  NETWORK_ERROR: "Gangguan jaringan. Periksa koneksi Anda.",
  CONFIG_ERROR: "Konfigurasi aplikasi bermasalah.",
  CONFLICT_ERROR: "Terjadi konflik data.",
  UNAUTHORIZED_ERROR: "Akses tidak diizinkan.",
  BAD_REQUEST_ERROR: "Permintaan tidak valid.",
  TIMEOUT_ERROR: "Permintaan melebihi batas waktu.",
  CANCELED_ERROR: "Permintaan dibatalkan.",
  FORBIDDEN_ERROR: "Akses ditolak.",
  METHOD_NOT_ALLOWED_ERROR: "Metode tidak diizinkan.",
};

export function getFriendlyErrorMessage(code?: string, fallback?: string): string {
  if (!code) return fallback || "Terjadi kesalahan. Coba lagi.";
  const key = code as BackendErrorCode;
  return messages[key] || fallback || "Terjadi kesalahan. Coba lagi.";
} 