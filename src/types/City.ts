import { Province } from "./Province";
export type City = {
  id: string;
  name: string;
  province_id: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  Province?: Province; // Avoid circular dependency
  locations?: Location[]; // Avoid circular dependency
  events?: Event[];
};
