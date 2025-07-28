import { Province } from "@/types/Province";
import { BaseApiService } from './baseApiService';

/**
 * Province service for managing province-related API operations
 */
export class ProvinceService extends BaseApiService {
  /**
   * Fetch all provinces
   * @returns Promise resolving to array of provinces
   */
  static async fetchProvinces(): Promise<Province[]> {
    try {
      const response = await this.get<Province[]>('/provinces');
      
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch provinces");
      }

      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch provinces:", error);
      throw error;
    }
  }

  /**
   * Get province by ID
   * @param provinceId Province's unique identifier
   * @returns Promise resolving to a province or null
   */
  static async getProvinceById(provinceId: string): Promise<Province | null> {
    try {
      const response = await this.get<Province>(`/provinces/${provinceId}`);

      if (!response.success) {
        throw new Error(response.error || "Failed to get province by ID");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to get province by ID:", error);
      throw error;
    }
  }

  /**
   * Create a new province
   * @param provinceData Province data to create
   * @returns Promise resolving to the created province
   */
  static async createProvince(provinceData: Partial<Province>): Promise<Province> {
    try {
      const response = await this.post<Partial<Province>, Province>('/provinces', provinceData);

      if (!response.success) {
        throw new Error(response.error || "Failed to create province");
      }

      if (!response.data) {
        throw new Error("No province data returned");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to create province:", error);
      throw error;
    }
  }

  /**
   * Update an existing province
   * @param provinceId Province's unique identifier
   * @param provinceData Province data to update
   * @returns Promise resolving to the updated province
   */
  static async updateProvince(
    provinceId: string, 
    provinceData: Partial<Province>
  ): Promise<Province> {
    try {
      const response = await this.put<Partial<Province>, Province>(`/provinces/${provinceId}`, provinceData);

      if (!response.success) {
        throw new Error(response.error || "Failed to update province");
      }

      if (!response.data) {
        throw new Error("No province data returned");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to update province:", error);
      throw error;
    }
  }

  /**
   * Delete a province
   * @param provinceId Province's unique identifier
   * @returns Promise resolving to the deletion result
   */
  static async deleteProvince(provinceId: string): Promise<boolean> {
    try {
      const response = await this.delete(`/provinces/${provinceId}`);

      if (!response.success) {
        throw new Error(response.error || "Failed to delete province");
      }

      return true;
    } catch (error) {
      console.error("Failed to delete province:", error);
      throw error;
    }
  }

  /**
   * Fetch provinces by region
   * @param regionId Region's unique identifier
   * @returns Promise resolving to array of provinces
   */
  static async fetchProvincesByRegion(regionId: string): Promise<Province[]> {
    try {
      const response = await this.get<Province[]>(`/regions/${regionId}/provinces`);
      
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch provinces by region");
      }

      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch provinces by region:", error);
      throw error;
    }
  }
}
