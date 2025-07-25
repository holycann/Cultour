import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Buat instance axios dengan konfigurasi dasar
export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://cultour.holyycan.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token autentikasi
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor untuk penanganan kesalahan global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tangani kesalahan umum
    if (error.response) {
      // Server merespons dengan status di luar rentang 2xx
      switch (error.response.status) {
        case 401:
          // Token tidak valid, mungkin perlu logout
          SecureStore.deleteItemAsync('auth_token');
          break;
        case 403:
          console.error('Akses ditolak');
          break;
        case 404:
          console.error('Sumber tidak ditemukan');
          break;
        case 500:
          console.error('Kesalahan server internal');
          break;
      }
    } else if (error.request) {
      // Permintaan dibuat tetapi tidak ada respons
      console.error('Tidak ada respons dari server');
    } else {
      // Terjadi kesalahan saat menyiapkan permintaan
      console.error('Kesalahan', error.message);
    }
    return Promise.reject(error);
  }
); 