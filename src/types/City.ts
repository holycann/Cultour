import { Province } from "./Province";

export interface City {
  id: string;
  name: string;
  description: string;
  province_id: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;

  province?: Province;
}

export interface CityOptions {
  province_id?: string;
}
