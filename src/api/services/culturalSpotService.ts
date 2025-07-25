import { api } from '../config';
import { ApiResponse, CulturalSpot } from '../types';

export const culturalSpotService = {
  // Dapatkan daftar tempat wisata
  async getAllSpots(params?: {
    page?: number;
    limit?: number;
    city?: string;
    tags?: string[];
  }): Promise<ApiResponse<{
    spots: CulturalSpot[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const response = await api.get<ApiResponse<{
        spots: CulturalSpot[];
        total: number;
        page: number;
        limit: number;
      }>>('/cultural-spots', { params });
      return response.data;
    } catch (error: any) {
      console.error('Gagal mengambil tempat wisata:', error);
      throw error;
    }
  },

  // Dapatkan detail tempat wisata berdasarkan ID
  async getSpotById(spotId: string): Promise<ApiResponse<CulturalSpot>> {
    try {
      const response = await api.get<ApiResponse<CulturalSpot>>(`/cultural-spots/${spotId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Gagal mengambil detail tempat wisata ${spotId}:`, error);
      throw error;
    }
  },

  // Cari tempat wisata
  async searchSpots(query: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    spots: CulturalSpot[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const response = await api.get<ApiResponse<{
        spots: CulturalSpot[];
        total: number;
        page: number;
        limit: number;
      }>>('/cultural-spots/search', { 
        params: { 
          query, 
          ...params 
        } 
      });
      return response.data;
    } catch (error: any) {
      console.error('Gagal mencari tempat wisata:', error);
      throw error;
    }
  },

  // Tandai tempat wisata yang dikunjungi
  async markSpotVisited(spotId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.post<ApiResponse<void>>(`/cultural-spots/${spotId}/visit`);
      return response.data;
    } catch (error: any) {
      console.error(`Gagal menandai kunjungan ke tempat wisata ${spotId}:`, error);
      throw error;
    }
  },

  // Dapatkan rekomendasi tempat wisata
  async getRecommendedSpots(params?: {
    limit?: number;
  }): Promise<ApiResponse<CulturalSpot[]>> {
    try {
      const response = await api.get<ApiResponse<CulturalSpot[]>>('/cultural-spots/recommended', { params });
      return response.data;
    } catch (error: any) {
      console.error('Gagal mengambil rekomendasi tempat wisata:', error);
      throw error;
    }
  }
}; 