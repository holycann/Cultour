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
      return await this.get<Province[]>('/provinces');
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
      return await this.get<Province>(`/provinces/${provinceId}`);
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
      return await this.post<Partial<Province>, Province>('/provinces', provinceData);
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
      return await this.put<Partial<Province>, Province>(`/provinces/${provinceId}`, provinceData);
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
      await this.delete(`/provinces/${provinceId}`);
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
      return await this.get<Province[]>(`/regions/${regionId}/provinces`);
    } catch (error) {
      console.error("Failed to fetch provinces by region:", error);
      throw error;
    }
  }
}
