import * as SecureStore from 'expo-secure-store';
import { api } from '../config';
import { ApiResponse, AuthCredentials, RegisterPayload, UserProfile } from '../types';

export const authService = {
  // Mendaftarkan pengguna baru
  async register(payload: RegisterPayload): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await api.post<ApiResponse<UserProfile>>('/auth/register', payload);
      return response.data;
    } catch (error: any) {
      console.error('Registrasi gagal:', error);
      throw error;
    }
  },

  // Login pengguna
  async login(credentials: AuthCredentials): Promise<ApiResponse<{ token: string; user: UserProfile }>> {
    try {
      const response = await api.post<ApiResponse<{ token: string; user: UserProfile }>>('/auth/login', credentials);
      
      if (response.data.success && response.data.data?.token) {
        // Simpan token ke secure storage
        await SecureStore.setItemAsync('auth_token', response.data.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login gagal:', error);
      throw error;
    }
  },

  // Logout pengguna
  async logout(): Promise<void> {
    try {
      // Panggil endpoint logout di backend jika diperlukan
      await api.post('/auth/logout');
      
      // Hapus token dari secure storage
      await SecureStore.deleteItemAsync('auth_token');
    } catch (error: any) {
      console.error('Logout gagal:', error);
      throw error;
    }
  },

  // Periksa status autentikasi
  async checkAuthStatus(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      
      if (!token) return false;

      // Validasi token dengan backend
      const response = await api.get<ApiResponse<UserProfile>>('/auth/validate');
      return response.data.success;
    } catch (error) {
      // Token tidak valid atau kadaluarsa
      await SecureStore.deleteItemAsync('auth_token');
      return false;
    }
  },

  // Minta ulang token
  async refreshToken(): Promise<string | null> {
    try {
      const response = await api.post<ApiResponse<{ token: string }>>('/auth/refresh');
      
      if (response.data.success && response.data.data?.token) {
        await SecureStore.setItemAsync('auth_token', response.data.data.token);
        return response.data.data.token;
      }
      
      return null;
    } catch (error) {
      console.error('Refresh token gagal:', error);
      return null;
    }
  }
}; 