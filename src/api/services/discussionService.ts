import { api } from '../config';
import { ApiResponse, Message, Thread } from '../types';

export const discussionService = {
  // Dapatkan daftar thread
  async getAllThreads(params?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<ApiResponse<{
    threads: Thread[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const response = await api.get<ApiResponse<{
        threads: Thread[];
        total: number;
        page: number;
        limit: number;
      }>>('/discussions/threads', { params });
      return response.data;
    } catch (error: any) {
      console.error('Gagal mengambil daftar thread:', error);
      throw error;
    }
  },

  // Buat thread baru
  async createThread(threadData: {
    title: string;
    content: string;
    category?: string;
  }): Promise<ApiResponse<Thread>> {
    try {
      const response = await api.post<ApiResponse<Thread>>('/discussions/threads', threadData);
      return response.data;
    } catch (error: any) {
      console.error('Gagal membuat thread:', error);
      throw error;
    }
  },

  // Dapatkan detail thread berdasarkan ID
  async getThreadById(threadId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Thread & {
    messages: Message[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const response = await api.get<ApiResponse<Thread & {
        messages: Message[];
        total: number;
        page: number;
        limit: number;
      }>>(`/discussions/threads/${threadId}`, { params });
      return response.data;
    } catch (error: any) {
      console.error(`Gagal mengambil detail thread ${threadId}:`, error);
      throw error;
    }
  },

  // Kirim pesan di thread
  async sendMessage(threadId: string, messageData: {
    content: string;
  }): Promise<ApiResponse<Message>> {
    try {
      const response = await api.post<ApiResponse<Message>>(`/discussions/threads/${threadId}/messages`, messageData);
      return response.data;
    } catch (error: any) {
      console.error(`Gagal mengirim pesan di thread ${threadId}:`, error);
      throw error;
    }
  },

  // Hapus thread
  async deleteThread(threadId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete<ApiResponse<void>>(`/discussions/threads/${threadId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Gagal menghapus thread ${threadId}:`, error);
      throw error;
    }
  },

  // Hapus pesan
  async deleteMessage(threadId: string, messageId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete<ApiResponse<void>>(`/discussions/threads/${threadId}/messages/${messageId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Gagal menghapus pesan ${messageId} di thread ${threadId}:`, error);
      throw error;
    }
  },

  // Cari thread
  async searchThreads(query: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    threads: Thread[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const response = await api.get<ApiResponse<{
        threads: Thread[];
        total: number;
        page: number;
        limit: number;
      }>>('/discussions/threads/search', { 
        params: { 
          query, 
          ...params 
        } 
      });
      return response.data;
    } catch (error: any) {
      console.error('Gagal mencari thread:', error);
      throw error;
    }
  }
}; 