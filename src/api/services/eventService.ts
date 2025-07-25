import { api } from '../config';
import { ApiResponse, Event } from '../types';

export const eventService = {
  // Dapatkan daftar event
  async getAllEvents(params?: {
    page?: number;
    limit?: number;
    city?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    events: Event[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const response = await api.get<ApiResponse<{
        events: Event[];
        total: number;
        page: number;
        limit: number;
      }>>('/events', { params });
      return response.data;
    } catch (error: any) {
      console.error('Gagal mengambil daftar event:', error);
      throw error;
    }
  },

  // Dapatkan detail event berdasarkan ID
  async getEventById(eventId: string): Promise<ApiResponse<Event>> {
    try {
      const response = await api.get<ApiResponse<Event>>(`/events/${eventId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Gagal mengambil detail event ${eventId}:`, error);
      throw error;
    }
  },

  // Cari event
  async searchEvents(query: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    events: Event[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const response = await api.get<ApiResponse<{
        events: Event[];
        total: number;
        page: number;
        limit: number;
      }>>('/events/search', { 
        params: { 
          query, 
          ...params 
        } 
      });
      return response.data;
    } catch (error: any) {
      console.error('Gagal mencari event:', error);
      throw error;
    }
  },

  // Daftar event
  async registerForEvent(eventId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.post<ApiResponse<void>>(`/events/${eventId}/register`);
      return response.data;
    } catch (error: any) {
      console.error(`Gagal mendaftar event ${eventId}:`, error);
      throw error;
    }
  },

  // Batalkan pendaftaran event
  async unregisterFromEvent(eventId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete<ApiResponse<void>>(`/events/${eventId}/register`);
      return response.data;
    } catch (error: any) {
      console.error(`Gagal membatalkan pendaftaran event ${eventId}:`, error);
      throw error;
    }
  },

  // Dapatkan event yang terdaftar pengguna
  async getUserRegisteredEvents(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    events: Event[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const response = await api.get<ApiResponse<{
        events: Event[];
        total: number;
        page: number;
        limit: number;
      }>>('/events/registered', { params });
      return response.data;
    } catch (error: any) {
      console.error('Gagal mengambil event terdaftar:', error);
      throw error;
    }
  },

  // Dapatkan rekomendasi event
  async getRecommendedEvents(params?: {
    limit?: number;
  }): Promise<ApiResponse<Event[]>> {
    try {
      const response = await api.get<ApiResponse<Event[]>>('/events/recommended', { params });
      return response.data;
    } catch (error: any) {
      console.error('Gagal mengambil rekomendasi event:', error);
      throw error;
    }
  }
}; 