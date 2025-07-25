import { api } from '../config';
import { ApiResponse, UserProfile } from '../types';

export const userService = {
  // Dapatkan profil pengguna saat ini
  async getCurrentProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await api.get<ApiResponse<UserProfile>>('/users/profile');
      return response.data;
    } catch (error: any) {
      console.error('Gagal mengambil profil:', error);
      throw error;
    }
  },

  // Perbarui profil pengguna
  async updateProfile(profileData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await api.put<ApiResponse<UserProfile>>('/users/profile', profileData);
      return response.data;
    } catch (error: any) {
      console.error('Gagal memperbarui profil:', error);
      throw error;
    }
  },

  // Ganti kata sandi
  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.post<ApiResponse<void>>('/users/change-password', {
        oldPassword,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      console.error('Gagal mengganti kata sandi:', error);
      throw error;
    }
  },

  // Dapatkan daftar pencapaian pengguna
  async getUserAchievements(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    earnedAt: string;
  }>>> {
    try {
      const response = await api.get<ApiResponse<Array<{
        id: string;
        name: string;
        description: string;
        earnedAt: string;
      }>>>('/users/achievements');
      return response.data;
    } catch (error: any) {
      console.error('Gagal mengambil pencapaian:', error);
      throw error;
    }
  },

  // Dapatkan statistik pengguna
  async getUserStatistics(): Promise<ApiResponse<{
    totalVisitedPlaces: number;
    totalEventsAttended: number;
    totalDiscussionParticipation: number;
  }>> {
    try {
      const response = await api.get<ApiResponse<{
        totalVisitedPlaces: number;
        totalEventsAttended: number;
        totalDiscussionParticipation: number;
      }>>('/users/statistics');
      return response.data;
    } catch (error: any) {
      console.error('Gagal mengambil statistik:', error);
      throw error;
    }
  }
}; 